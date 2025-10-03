import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecurrenceCalculation {
  nextDate: Date;
  nextTime: string;
  interval: number;
  freq: string;
}

function intervalOrDefault(rule: string, def: number): number {
  const match = rule.match(/INTERVAL=(\d+)/);
  return match ? parseInt(match[1]) : def;
}

function calculateNextDate(currentDate: string, currentTime: string, rule: string): RecurrenceCalculation {
  const baseDate = new Date(`${currentDate}T${currentTime}Z`);
  let nextDate: Date;
  const normalizedRule = rule.toUpperCase();
  const interval = intervalOrDefault(rule, 1);
  let freq = 'YEARLY';

  if (normalizedRule.includes('FREQ=DAILY') || normalizedRule === 'DAILY') {
    freq = 'DAILY';
    nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + interval);
  } else if (normalizedRule.includes('FREQ=WEEKLY') || normalizedRule === 'WEEKLY') {
    freq = 'WEEKLY';
    nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + interval * 7);
  } else if (normalizedRule.includes('FREQ=MONTHLY') || normalizedRule === 'MONTHLY') {
    freq = 'MONTHLY';
    nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + interval);
  } else if (normalizedRule.includes('FREQ=YEARLY') || normalizedRule === 'YEARLY') {
    freq = 'YEARLY';
    nextDate = new Date(baseDate);
    nextDate.setFullYear(nextDate.getFullYear() + interval);
  } else {
    // fallback
    nextDate = new Date(baseDate);
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return {
    nextDate,
    nextTime: currentTime,
    interval,
    freq
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { appointmentId } = await req.json()
    
    if (!appointmentId) {
      throw new Error('appointmentId é obrigatório')
    }

    console.log('Processing appointment completion:', appointmentId)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Buscar o agendamento concluído
    const { data: completedAppointment, error: fetchError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar agendamento:', fetchError)
      throw new Error(`Agendamento não encontrado: ${fetchError.message}`)
    }

    console.log(`Agendamento encontrado: ${completedAppointment.id}, Regra de Recorrência: ${completedAppointment.recurrence_rule}`)

    // 2. Verificar se é recorrente
    if (!completedAppointment.recurrence_rule) {
      console.log('Agendamento não é recorrente. Nenhuma ação necessária.')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Agendamento não recorrente. Nenhuma ação necessária.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // 3. Calcular próxima data
    const { nextDate, nextTime, interval, freq } = calculateNextDate(
      completedAppointment.date,
      completedAppointment.time,
      completedAppointment.recurrence_rule
    )

    if (!nextDate) {
      console.error('Não foi possível calcular a próxima data para o agendamento:', completedAppointment.id)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao calcular próxima data.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Calculando próximo agendamento: Frequência=${freq}, Intervalo=${interval}, Próxima Data=${nextDate.toISOString().split('T')[0]}`)

    // 4. Criar novo agendamento
    const newAppointmentData = {
      user_id: completedAppointment.user_id,
      client_id: completedAppointment.client_id,
      policy_id: completedAppointment.policy_id,
      title: completedAppointment.title,
      date: nextDate.toISOString().split('T')[0],
      time: nextTime,
      status: 'Pendente',
      notes: completedAppointment.notes,
      priority: completedAppointment.priority || 'Normal',
      recurrence_rule: completedAppointment.recurrence_rule,
      is_recurring: true,
      parent_appointment_id: completedAppointment.parent_appointment_id || completedAppointment.id,
    }

    const { data: newAppointment, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert(newAppointmentData)
      .select('id')
      .single()

    if (insertError || !newAppointment) {
      console.error('Erro ao criar próximo agendamento:', insertError)
      throw new Error(`Erro ao criar próximo agendamento: ${insertError?.message}`)
    }

    console.log(`Próximo agendamento criado com sucesso: ID=${newAppointment.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        newAppointmentId: newAppointment.id,
        nextDate: nextDate.toISOString().split('T')[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
