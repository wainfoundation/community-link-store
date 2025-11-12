import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, whop-signature',
};

interface WhopPaymentWebhook {
  type: 'payment.succeeded';
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    final_amount: number;
    metadata?: {
      product_id?: string;
      seller_id?: string;
    };
    company_id: string;
    customer_id: string;
    receipt_url: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Whop Webhook] Received webhook request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the webhook payload
    const payload: WhopPaymentWebhook = await req.json();
    console.log('[Whop Webhook] Payload type:', payload.type);

    // Only process payment succeeded events
    if (payload.type !== 'payment.succeeded') {
      console.log('[Whop Webhook] Ignoring non-payment event');
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const paymentData = payload.data;
    console.log('[Whop Webhook] Processing payment:', paymentData.id);

    // Get product and seller info
    const productId = paymentData.metadata?.product_id;
    if (!productId) {
      console.error('[Whop Webhook] No product_id in metadata');
      return new Response(JSON.stringify({ error: 'Missing product_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, user_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('[Whop Webhook] Product not found:', productError);
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Calculate platform fee (10% platform fee)
    const platformFeeRate = 0.10;
    const totalAmount = paymentData.final_amount;
    const platformFee = totalAmount * platformFeeRate;
    const sellerAmount = totalAmount - platformFee;

    console.log('[Whop Webhook] Payment breakdown:', {
      total: totalAmount,
      platformFee,
      sellerAmount,
    });

    // Create order record
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: product.id,
        product_name: product.name,
        amount: totalAmount,
        whop_payment_id: paymentData.id,
        seller_id: product.user_id,
        seller_amount: sellerAmount,
        platform_fee: platformFee,
        customer_email: 'whop@customer.com', // Whop handles customer data
        customer_name: 'Whop Customer',
      });

    if (orderError) {
      console.error('[Whop Webhook] Error creating order:', orderError);
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('[Whop Webhook] Order created successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully',
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Whop Webhook] Error:', error);
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
