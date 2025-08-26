
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = 'https://jaouwhckqqnaxqyfvgyq.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// ID da sua planilha extraído da URL
const SPREADSHEET_ID = '1o_WtKQe8huRjXnGauf5DfQLqUOTsfKuXRtDLgaYC0AM'
const SHEET_NAME = 'Página1' // Ajuste se necessário

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obter credenciais do Google Sheets
    const credentialsJson = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS')
    if (!credentialsJson) {
      throw new Error('Credenciais do Google Sheets não encontradas')
    }

    const credentials = JSON.parse(credentialsJson)

    // Obter a data de ontem
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    console.log(`Sincronizando métricas para ${dateStr}`)

    // Buscar métricas pendentes de sincronização
    const { data: metrics, error: metricsError } = await supabase
      .from('daily_metrics')
      .select(`
        *,
        profiles!inner(nome_completo)
      `)
      .eq('date', dateStr)
      .eq('sync_status', 'pending')

    if (metricsError) throw metricsError

    if (!metrics || metrics.length === 0) {
      console.log('Nenhuma métrica pendente para sincronizar')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma métrica pendente',
          synced: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Obter token de acesso do Google
    const token = await getGoogleAccessToken(credentials)

    let syncedCount = 0
    const errors: string[] = []

    for (const metric of metrics) {
      try {
        // Formatar data brasileira
        const date = new Date(metric.date)
        const formattedDate = date.toLocaleDateString('pt-BR')

        // Calcular produção total
        const producaoTotal = 
          metric.consorcio_value + 
          metric.saude_value + 
          metric.auto_value + 
          metric.residencial_value + 
          metric.empresarial_value + 
          metric.outros_value

        // Preparar dados para a planilha
        const rowData = [
          formattedDate,                    // Data
          metric.profiles?.nome_completo || 'N/A', // Corretor
          metric.consorcio_value,           // Consórcio (R$)
          metric.saude_value,               // Saúde (R$)
          metric.auto_value,                // Auto (R$)
          metric.residencial_value,         // Residencial (R$)
          metric.empresarial_value,         // Empresarial (R$)
          metric.outros_value,              // Outros (R$)
          producaoTotal,                    // Produção Total (calculada automaticamente na planilha)
          metric.apolices_novas,            // Apólices Novas
          metric.renovacoes,                // Renovações
          metric.apolices_perdidas          // Apólices Perdidas
        ]

        // Enviar para Google Sheets
        await appendToSheet(token, SPREADSHEET_ID, SHEET_NAME, [rowData])

        // Marcar como sincronizada
        await supabase
          .from('daily_metrics')
          .update({
            sync_status: 'synced',
            synced_at: new Date().toISOString()
          })
          .eq('id', metric.id)

        syncedCount++
        console.log(`Métrica sincronizada para ${metric.profiles?.nome_completo}`)

      } catch (syncError) {
        console.error(`Erro ao sincronizar métrica ${metric.id}:`, syncError)
        errors.push(`Erro para ${metric.profiles?.nome_completo}: ${syncError.message}`)

        // Marcar como erro
        await supabase
          .from('daily_metrics')
          .update({
            sync_status: 'error',
            error_message: syncError.message
          })
          .eq('id', metric.id)
      }
    }

    // Registrar log de sincronização
    const executionTime = Date.now() - startTime
    
    for (const metric of metrics) {
      await supabase
        .from('sheets_sync_logs')
        .insert({
          user_id: metric.user_id,
          sync_date: dateStr,
          status: errors.length > 0 ? 'partial_success' : 'success',
          message: errors.length > 0 ? errors.join('; ') : `${syncedCount} métricas sincronizadas`,
          execution_time_ms: executionTime
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        synced: syncedCount,
        errors: errors.length,
        date: dateStr,
        execution_time_ms: executionTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na sincronização:', error)
    
    const executionTime = Date.now() - startTime
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        execution_time_ms: executionTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function getGoogleAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  // Criar JWT
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payloadEncoded = btoa(JSON.stringify(payload))
  
  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(credentials.private_key.replace(/\\n/g, '\n')),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${payloadEncoded}`)
  )

  const jwt = `${header}.${payloadEncoded}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`

  // Trocar JWT por token de acesso
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  const tokenData = await tokenResponse.json()
  
  if (!tokenResponse.ok) {
    throw new Error(`Erro ao obter token: ${tokenData.error_description || tokenData.error}`)
  }

  return tokenData.access_token
}

async function appendToSheet(token: string, spreadsheetId: string, sheetName: string, values: any[][]) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: values
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Erro ao adicionar dados à planilha: ${errorData.error?.message || response.statusText}`)
  }

  return response.json()
}
