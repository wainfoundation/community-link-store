import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhopOAuthRequest {
  code: string;
  action: 'signin' | 'link';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whopClientId = Deno.env.get('WHOP_CLIENT_ID');
    const whopClientSecret = Deno.env.get('WHOP_CLIENT_SECRET');
    
    if (!whopClientId || !whopClientSecret) {
      throw new Error('Whop OAuth credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { code, action }: WhopOAuthRequest = await req.json();

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: whopClientId,
        client_secret: whopClientSecret,
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whop-oauth-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('[Whop OAuth] Token exchange failed:', error);
      throw new Error('Failed to exchange OAuth code');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get Whop user info
    const userResponse = await fetch('https://api.whop.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Whop user data');
    }

    const whopUser = await userResponse.json();
    console.log('[Whop OAuth] User data:', whopUser);

    if (action === 'link') {
      // Link existing account
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header for linking');
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Update profile with Whop connection
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          whop_user_id: whopUser.id,
          whop_access_token: access_token,
          whop_refresh_token: refresh_token,
          whop_token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          whop_linked_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Whop account linked successfully',
          whop_user_id: whopUser.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Sign in with Whop (create or login)
      // Check if user with this Whop ID exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('whop_user_id', whopUser.id)
        .maybeSingle();

      if (existingProfile) {
        // User exists, generate session token
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: `whop_${whopUser.id}@whop.internal`,
        });

        if (sessionError) throw sessionError;

        return new Response(
          JSON.stringify({ 
            success: true,
            action: 'signin',
            session: sessionData,
            whop_user: whopUser,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: `whop_${whopUser.id}@whop.internal`,
          email_confirm: true,
          user_metadata: {
            whop_user_id: whopUser.id,
            username: whopUser.username || whopUser.id,
          },
        });

        if (createError) throw createError;

        // Update profile with Whop data
        await supabase
          .from('profiles')
          .update({
            whop_user_id: whopUser.id,
            whop_access_token: access_token,
            whop_refresh_token: refresh_token,
            whop_token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
            whop_linked_at: new Date().toISOString(),
          })
          .eq('id', newUser.user.id);

        return new Response(
          JSON.stringify({ 
            success: true,
            action: 'signup',
            user: newUser.user,
            whop_user: whopUser,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('[Whop OAuth] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
