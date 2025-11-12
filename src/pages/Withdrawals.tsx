import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
}

interface SellerBalance {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
}

export default function Withdrawals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<SellerBalance | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    await Promise.all([fetchWithdrawals(), fetchBalance()]);
    setLoading(false);
  };

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("requested_at", { ascending: false });

    if (!error) {
      setWithdrawals(data || []);
    }
  };

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from("seller_balances")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (!error) {
      setBalance(data);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    const availableBalance = balance?.available_balance || 0;

    if (withdrawAmount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (withdrawAmount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user?.id,
          amount: withdrawAmount,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Withdrawal request submitted! Processing typically takes 1-3 business days.");
      setAmount("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Withdrawals</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">${balance?.available_balance?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground mt-2">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${balance?.pending_balance?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground mt-2">Being processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${balance?.total_earned?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground mt-2">All-time earnings</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Minimum $10)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max={balance?.available_balance || 0}
                  placeholder="10.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Withdrawals are processed via Whop and typically take 1-3 business days
                </p>
              </div>
              <Button type="submit" disabled={submitting || !balance || balance.available_balance < 10}>
                {submitting ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No withdrawals yet</p>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div>
                      <p className="font-semibold">${withdrawal.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={withdrawal.status === "completed" ? "default" : "secondary"}>
                      {withdrawal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
