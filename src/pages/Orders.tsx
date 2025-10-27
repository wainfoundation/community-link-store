import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import { mockOrders } from "@/lib/mockData";

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Orders
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Product</th>
                  <th className="text-left p-4 font-semibold text-foreground">Amount</th>
                  <th className="text-left p-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left p-4 font-semibold text-foreground">Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                      <p className="text-muted-foreground">Orders will appear here once customers make purchases</p>
                    </td>
                  </tr>
                ) : (
                  mockOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 text-foreground">{order.productName}</td>
                      <td className="p-4 text-foreground">${order.amount.toFixed(2)}</td>
                      <td className="p-4 text-foreground">{order.customerEmail}</td>
                      <td className="p-4 text-foreground">
                        {order.purchaseDate.toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;
