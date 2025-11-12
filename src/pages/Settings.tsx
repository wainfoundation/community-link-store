import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { WhopLinkButton } from "@/components/WhopLinkButton";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [whopUserId, setWhopUserId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchProfile();
    }

    // Handle Whop OAuth callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const isWhopCallback = searchParams.get('whop_callback') === 'true';
    
    if (code && state && isWhopCallback) {
      handleWhopCallback(code, state);
    }
  }, [user, authLoading, navigate, searchParams]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('whop_user_id')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setWhopUserId(data.whop_user_id);
    }
    setProfileLoading(false);
  };

  const handleWhopCallback = async (code: string, state: string) => {
    const storedState = sessionStorage.getItem('whop_oauth_state');
    const storedAction = sessionStorage.getItem('whop_oauth_action');
    
    if (state !== storedState) {
      toast.error('Invalid OAuth state');
      return;
    }

    if (storedAction !== 'link') {
      return; // Not a link action
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to link your Whop account');
        return;
      }

      const { data, error } = await supabase.functions.invoke('whop-oauth', {
        body: { code, action: 'link' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Whop account linked successfully!');
        sessionStorage.removeItem('whop_oauth_state');
        sessionStorage.removeItem('whop_oauth_action');
        fetchProfile();
        // Clean URL
        navigate('/settings', { replace: true });
      }
    } catch (error) {
      console.error('Whop linking error:', error);
      toast.error('Failed to link Whop account');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Cloudy looks for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label htmlFor="theme-toggle" className="cursor-pointer">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Whop Integration</CardTitle>
              <CardDescription>
                Connect your Whop account to enable automatic withdrawal processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <WhopLinkButton
                    isLinked={!!whopUserId}
                    whopUserId={whopUserId}
                    onLinkSuccess={fetchProfile}
                  />
                  {!whopUserId && (
                    <p className="text-sm text-muted-foreground">
                      Link your Whop account to withdraw your earnings directly to your Whop balance.
                      Whop supports 241+ payout methods including ACH, Crypto, Venmo, and CashApp.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
