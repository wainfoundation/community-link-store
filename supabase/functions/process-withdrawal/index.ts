import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawalRequest {
  withdrawal_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whopApiKey = Deno.env.get('WHOP_API_KEY');
    
    if (!whopApiKey) {
      throw new Error('WHOP_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { withdrawal_id }: WithdrawalRequest = await req.json();

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawal_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error('Withdrawal not found or already processed');
    }

    // Get seller balance
    const { data: balance, error: balanceError } = await supabase
      .from('seller_balances')
      .select('available_balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !balance) {
      throw new Error('Balance not found');
    }

    if (balance.available_balance < withdrawal.amount) {
      throw new Error('Insufficient balance');
    }

    // Get user's Whop user ID from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('whop_user_id')
      .eq('id', user.id)
      .single();

    if (!profile?.whop_user_id) {
      throw new Error('Please link your Whop account in Settings before requesting a withdrawal');
    }

    const whopUserId = profile.whop_user_id;

    // Create transfer via Whop API
    const transferResponse = await fetch('https://api.whop.com/api/v1/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: withdrawal.amount,
        currency: 'usd',
        destination_id: whopUserId,
        origin_id: Deno.env.get('WHOP_COMPANY_ID'),
        notes: `Withdrawal request ${withdrawal_id}`,
        idempotence_key: `withdrawal_${withdrawal_id}`,
      }),
    });

    if (!transferResponse.ok) {
      const error = await transferResponse.text();
      console.error('[Withdrawal] Transfer failed:', error);
      
      // Update withdrawal status to failed
      await supabase
        .from('withdrawals')
        .update({ status: 'failed' })
        .eq('id', withdrawal_id);
      
      throw new Error(`Transfer failed: ${error}`);
    }

    const transfer = await transferResponse.json();
    console.log('[Withdrawal] Transfer successful:', transfer);

    // Update withdrawal status
    await supabase
      .from('withdrawals')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawal_id);

    // Update seller balance
    await supabase
      .from('seller_balances')
      .update({ 
        available_balance: balance.available_balance - withdrawal.amount,
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Withdrawal processed successfully',
        transfer_id: transfer.id,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Withdrawal] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
