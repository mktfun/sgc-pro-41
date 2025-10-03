// 🔄 Edge Function para Backfill de Comissões Retroativas
// Esta função processa todas as apólices ativas sem transação de comissão e gera automaticamente

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

interface Policy {
  id: string;
  user_id: string;
  client_id: string;
  policy_number: string;
  insurance_company: string;
  premium_value: number;
  commission_rate: number;
  expiration_date: string;
  producer_id?: string;
  brokerage_id?: number;
  status: string;
}

async function getCommissionTypeId(supabaseClient: any, userId: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('transaction_types')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Comissão')
    .eq('nature', 'GANHO')
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar tipo de transação:', error);
    return null;
  }

  return data?.id || null;
}

async function generateCommissionTransaction(supabaseClient: any, policy: Policy) {
  console.log(`💰 Processando apólice: ${policy.policy_number}`);

  // 1. Verificar se já existe transação de comissão
  const { data: existingTransaction } = await supabaseClient
    .from('transactions')
    .select('id')
    .eq('policy_id', policy.id)
    .eq('nature', 'GANHO')
    .maybeSingle();

  if (existingTransaction) {
    console.log(`⚠️ Comissão já existe para apólice ${policy.policy_number}`);
    return { status: 'skipped', reason: 'already_exists' };
  }

  // 2. Obter o tipo de transação de comissão
  const commissionTypeId = await getCommissionTypeId(supabaseClient, policy.user_id);
  
  if (!commissionTypeId) {
    console.error(`❌ Tipo de transação "Comissão" não encontrado para usuário ${policy.user_id}`);
    return { status: 'error', reason: 'no_commission_type' };
  }

  // 3. Calcular valor da comissão
  const commissionAmount = (policy.premium_value * policy.commission_rate) / 100;

  if (commissionAmount <= 0) {
    console.log(`⚠️ Valor de comissão zero ou negativo para apólice ${policy.policy_number}`);
    return { status: 'skipped', reason: 'zero_commission' };
  }

  // 4. Criar transação de comissão
  const { error } = await supabaseClient
    .from('transactions')
    .insert({
      user_id: policy.user_id,
      client_id: policy.client_id,
      policy_id: policy.id,
      type_id: commissionTypeId,
      description: `Comissão da apólice ${policy.policy_number} (Retroativa)`,
      amount: commissionAmount,
      date: new Date().toISOString().split('T')[0],
      transaction_date: new Date().toISOString().split('T')[0],
      due_date: policy.expiration_date,
      status: 'PENDENTE',
      nature: 'GANHO',
      company_id: policy.insurance_company,
      brokerage_id: policy.brokerage_id,
      producer_id: policy.producer_id
    });

  if (error) {
    console.error(`❌ Erro ao criar transação para apólice ${policy.policy_number}:`, error.message);
    return { status: 'error', reason: error.message };
  }

  console.log(`✅ Comissão criada para apólice ${policy.policy_number}: R$ ${commissionAmount.toFixed(2)}`);
  return { status: 'success', amount: commissionAmount };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando backfill de comissões...');

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Buscar todas as apólices ativas
    const { data: activePolicies, error: policiesError } = await supabaseAdmin
      .from('apolices')
      .select('*')
      .eq('status', 'Ativa');

    if (policiesError) {
      console.error('❌ Erro ao buscar apólices:', policiesError);
      throw policiesError;
    }

    if (!activePolicies || activePolicies.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma apólice ativa encontrada.",
          summary: {
            total: 0,
            success: 0,
            skipped: 0,
            errors: 0
          }
        }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    console.log(`📊 Total de apólices ativas encontradas: ${activePolicies.length}`);

    // 2. Processar cada apólice
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const policy of activePolicies) {
      const result = await generateCommissionTransaction(supabaseAdmin, policy);
      
      if (result.status === 'success') {
        successCount++;
      } else if (result.status === 'skipped') {
        skippedCount++;
      } else {
        errorCount++;
      }

      results.push({
        policyNumber: policy.policy_number,
        ...result
      });
    }

    const summary = {
      total: activePolicies.length,
      success: successCount,
      skipped: skippedCount,
      errors: errorCount
    };

    console.log('📊 === RESUMO DO BACKFILL ===');
    console.log(`Total de apólices processadas: ${summary.total}`);
    console.log(`✅ Comissões criadas: ${summary.success}`);
    console.log(`⏭️ Puladas (já existiam): ${summary.skipped}`);
    console.log(`❌ Erros: ${summary.errors}`);

    return new Response(
      JSON.stringify({ 
        message: "Backfill de comissões concluído com sucesso!",
        summary,
        details: results
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro fatal no backfill:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
