// Função auxiliar para dividir array em pedaços (chunks)
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  let index = 0;
  while (index < array.length) {
    chunked.push(array.slice(index, size + index));
    index += size;
  }
  return chunked;
};

const fetchAllClients = async (): Promise<ClientReportData[]> => {
  if (!user) throw new Error("Usuário não autenticado");

  // 1. Buscar clientes (Isso não muda, a query inicial é segura)
  let clientQuery = supabase.from("clientes").select("*").eq("user_id", user.id);

  if (localFilters.status !== "todos") {
    clientQuery = clientQuery.eq("status", localFilters.status);
  }
  if (localFilters.searchTerm.trim()) {
    const term = localFilters.searchTerm.trim();
    clientQuery = clientQuery.or(`name.ilike.%${term}%,email.ilike.%${term}%,cpf_cnpj.ilike.%${term}%`);
  }

  const { data: clientsRaw, error: clientsError } = await clientQuery.order("name");
  if (clientsError) throw clientsError;
  if (!clientsRaw || clientsRaw.length === 0) {
    throw new Error("Nenhum cliente encontrado com os filtros aplicados.");
  }

  // 2. Buscar apólices ativas para agregação COM CHUNKING (A CURA DO ERRO 400)
  const clientIds = clientsRaw.map((c) => c.id);
  const idChunks = chunkArray(clientIds, 30); // Lotes de 30 IDs por vez para não estourar a URL

  let allPoliciesData: any[] = [];

  // Executar chamadas em paralelo (Promise.all) ou sequencial se quiser aliviar o banco
  // Vamos de Promise.all para velocidade, mas limitado pelos chunks
  const policyPromises = idChunks.map(async (chunk) => {
    const { data, error } = await supabase
      .from("apolices")
      .select("client_id, premium_value, status")
      .eq("user_id", user.id)
      .in("client_id", chunk)
      .eq("status", "Ativa");

    if (error) throw error;
    return data || [];
  });

  const results = await Promise.all(policyPromises);
  allPoliciesData = results.flat(); // Junta tudo num array só

  // 3. Agregar dados de apólices por cliente (O resto segue igual)
  const policyAggregation: Record<string, { count: number; total: number }> = {};
  allPoliciesData.forEach((p) => {
    if (!policyAggregation[p.client_id]) {
      policyAggregation[p.client_id] = { count: 0, total: 0 };
    }
    policyAggregation[p.client_id].count++;
    policyAggregation[p.client_id].total += Number(p.premium_value) || 0;
  });

  // 4. Mapear e aplicar filtros client-side (Tipo e Aniversário)
  let clients: ClientReportData[] = clientsRaw.map((client) => {
    const agg = policyAggregation[client.id] || { count: 0, total: 0 };
    return {
      id: client.id,
      nome: client.name,
      cpfCnpj: client.cpf_cnpj,
      email: client.email,
      telefone: client.phone,
      cidade: client.city,
      estado: client.state,
      dataNascimento: client.birth_date,
      dataCadastro: client.created_at,
      status: client.status,
      qtdeApolices: agg.count,
      valorTotalPremio: agg.total,
    };
  });

  // Filtro por TIPO (PF/PJ)
  if (localFilters.tipo !== "todos") {
    clients = clients.filter((c) => {
      const doc = c.cpfCnpj?.replace(/\D/g, "") || "";
      if (localFilters.tipo === "PF") {
        return doc.length <= 11; // CPF ou sem documento
      }
      return doc.length > 11; // CNPJ
    });
  }

  // Filtro por MÊS DE ANIVERSÁRIO
  if (localFilters.mesAniversario !== "todos") {
    const targetMonth = parseInt(localFilters.mesAniversario, 10);
    clients = clients.filter((c) => {
      if (!c.dataNascimento) return false;
      // Fix timezone issue parsing date string purely
      const parts = c.dataNascimento.split("-"); // YYYY-MM-DD
      if (parts.length !== 3) return false;
      const month = parseInt(parts[1], 10);
      return month === targetMonth;
    });
  }

  if (clients.length === 0) {
    throw new Error("Nenhum cliente encontrado após aplicar todos os filtros.");
  }

  return clients;
};
