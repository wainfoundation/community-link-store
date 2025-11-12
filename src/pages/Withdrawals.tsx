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
}

export default function Withdrawals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);

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
      .from("orders")
      .select("amount");

    if (!error) {
      const total = data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
      setBalance(total);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > balance) {
      toast.error("Insufficient balance");
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

      toast.success("Withdrawal request submitted!");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">${balance.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={balance}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitting || balance === 0}>
                  {submitting ? "Submitting..." : "Request Withdrawal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

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
