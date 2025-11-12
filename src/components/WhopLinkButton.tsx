import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WHOP_CONFIG } from "@/lib/whop-config";

interface WhopLinkButtonProps {
  isLinked: boolean;
  whopUserId?: string | null;
  onLinkSuccess: () => void;
}

export function WhopLinkButton({ isLinked, whopUserId, onLinkSuccess }: WhopLinkButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLinkWhop = () => {
    setLoading(true);
    
    // Construct Whop OAuth URL
    const redirectUri = `${window.location.origin}/settings?whop_callback=true`;
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('whop_oauth_state', state);
    sessionStorage.setItem('whop_oauth_action', 'link');
    
    const authUrl = new URL('https://whop.com/oauth');
    authUrl.searchParams.append('client_id', WHOP_CONFIG.appId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'openid profile email');
    
    // Redirect to Whop OAuth
    window.location.href = authUrl.toString();
  };

  if (isLinked && whopUserId) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Connected to Whop ({whopUserId})</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleLinkWhop}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Connect Whop Account
        </>
      )}
    </Button>
  );
}
