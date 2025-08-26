
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = 'https://jaouwhckqqnaxqyfvgyq.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obter a data de ontem
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    console.log(`Consolidando métricas para ${dateStr}`)

    // Buscar todos os usuários ativos
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('ativo', true)

    if (usersError) throw usersError

    let consolidatedCount = 0

    for (const user of users) {
      try {
        // Verificar se já existe métrica para esta data
        const { data: existingMetric } = await supabase
          .from('daily_metrics')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .single()

        if (existingMetric) {
          console.log(`Métrica já existe para usuário ${user.id} em ${dateStr}`)
          continue
        }

        // Buscar transações do dia anterior
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('nature, amount, type_id')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .eq('status', 'REALIZADO')

        if (transError) throw transError

        // Buscar apólices criadas no dia
        const { data: newPolicies, error: policiesError } = await supabase
          .from('apolices')
          .select('type, status')
          .eq('user_id', user.id)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        if (policiesError) throw policiesError

        // Calcular valores por ramo
        let consorcioValue = 0
        let saudeValue = 0
        let autoValue = 0
        let residencialValue = 0
        let empresarialValue = 0
        let outrosValue = 0

        transactions?.forEach(transaction => {
          if (transaction.nature === 'RECEITA') {
            // Mapear por tipo de transação - assumindo que type_id contém o ramo
            const typeId = transaction.type_id?.toLowerCase() || ''
            const amount = Number(transaction.amount) || 0

            if (typeId.includes('consorcio') || typeId.includes('consórcio')) {
              consorcioValue += amount
            } else if (typeId.includes('saude') || typeId.includes('saúde')) {
              saudeValue += amount
            } else if (typeId.includes('auto') || typeId.includes('veiculo') || typeId.includes('veículo')) {
              autoValue += amount
            } else if (typeId.includes('residencial') || typeId.includes('residencia') || typeId.includes('residência')) {
              residencialValue += amount
            } else if (typeId.includes('empresarial') || typeId.includes('empresa')) {
              empresarialValue += amount
            } else {
              outrosValue += amount
            }
          }
        })

        // Contar apólices por status
        let apolicesNovas = 0
        let renovacoes = 0

        newPolicies?.forEach(policy => {
          if (policy.status === 'Ativa') {
            if (policy.renewal_status === 'Renovada') {
              renovacoes++
            } else {
              apolicesNovas++
            }
          }
        })

        // Inserir métrica consolidada
        const { error: insertError } = await supabase
          .from('daily_metrics')
          .insert({
            user_id: user.id,
            date: dateStr,
            consorcio_value: consorcioValue,
            saude_value: saudeValue,
            auto_value: autoValue,
            residencial_value: residencialValue,
            empresarial_value: empresarialValue,
            outros_value: outrosValue,
            apolices_novas: apolicesNovas,
            renovacoes: renovacoes,
            apolices_perdidas: 0, // Por enquanto 0, pode ser implementado depois
            sync_status: 'pending'
          })

        if (insertError) throw insertError

        consolidatedCount++
        console.log(`Métrica consolidada para usuário ${user.id}`)

      } catch (userError) {
        console.error(`Erro ao consolidar dados do usuário ${user.id}:`, userError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        consolidated: consolidatedCount,
        date: dateStr 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na consolidação:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
