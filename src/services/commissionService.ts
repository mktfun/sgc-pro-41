
import { supabase } from '@/integrations/supabase/client';
import { Policy } from '@/types';

export const DEFAULT_TRANSACTION_TYPES = {
  COMMISSION: 'commission-default',
  EXPENSE: 'expense-default',
  INCOME: 'income-default'
};

export async function ensureDefaultTransactionTypes(userId: string) {
  console.log('🔧 Ensuring default transaction types for user:', userId);
  
  // Check if default commission type exists
  const { data: existingCommission } = await supabase
    .from('transaction_types')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Comissão')
    .eq('nature', 'GANHO')
    .maybeSingle();

  if (!existingCommission) {
    console.log('📝 Creating default commission transaction type');
    const { error } = await supabase
      .from('transaction_types')
      .insert({
        user_id: userId,
        name: 'Comissão',
        nature: 'GANHO'
      });

    if (error) {
      console.error('Error creating default commission type:', error);
    } else {
      console.log('✅ Default commission type created');
    }
  }

  // Check if default expense type exists
  const { data: existingExpense } = await supabase
    .from('transaction_types')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Despesa')
    .eq('nature', 'PERDA')
    .maybeSingle();

  if (!existingExpense) {
    console.log('📝 Creating default expense transaction type');
    const { error } = await supabase
      .from('transaction_types')
      .insert({
        user_id: userId,
        name: 'Despesa',
        nature: 'PERDA'
      });

    if (error) {
      console.error('Error creating default expense type:', error);
    } else {
      console.log('✅ Default expense type created');
    }
  }
}

// Function to get the commission transaction type ID for a user
export async function getCommissionTypeId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('transaction_types')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Comissão')
    .eq('nature', 'GANHO')
    .maybeSingle();

  if (error) {
    console.error('Error fetching commission type:', error);
    return null;
  }

  return data?.id || null;
}

// 🎯 **FUNÇÃO CENTRALIZADA ÚNICA** - Function to generate commission transaction for a policy
export async function gerarTransacaoDeComissao(policy: Policy) {
  console.log('💰 [CENTRALIZADA] Generating commission transaction for policy:', policy.policyNumber);
  
  if (!policy.userId) {
    console.error('❌ No user ID found for policy');
    return;
  }

  // 🛡️ **VERIFICAÇÃO ANTI-DUPLICATA** - Check if commission already exists for this policy
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('id')
    .eq('policy_id', policy.id)
    .eq('nature', 'RECEITA')
    .maybeSingle();

  if (existingTransaction) {
    console.log('⚠️ Commission transaction already exists for policy:', policy.policyNumber);
    return existingTransaction;
  }

  // Get the commission transaction type ID
  const commissionTypeId = await getCommissionTypeId(policy.userId);
  
  if (!commissionTypeId) {
    console.error('❌ No commission transaction type found for user');
    return;
  }

  // Calculate commission amount
  const commissionAmount = (policy.premiumValue * policy.commissionRate) / 100;
  
  if (commissionAmount <= 0) {
    console.log('⚠️ Commission amount is zero or negative, skipping transaction creation');
    return;
  }

  // 🎯 **CRIAÇÃO ÚNICA DA COMISSÃO**
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: policy.userId,
      client_id: policy.clientId,
      policy_id: policy.id,
      type_id: commissionTypeId,
      description: `Comissão da apólice ${policy.policyNumber}`,
      amount: commissionAmount,
      date: new Date().toISOString().split('T')[0],
      transaction_date: new Date().toISOString().split('T')[0],
      due_date: policy.expirationDate,
      status: 'PENDENTE',
      nature: 'RECEITA',
      brokerage_id: policy.brokerageId,
      producer_id: policy.producerId
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating commission transaction:', error);
    throw error;
  }

  console.log('✅ [CENTRALIZADA] Commission transaction created successfully:', data);
  return data;
}
