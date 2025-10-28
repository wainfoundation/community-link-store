import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  digital_file_url: string | null;
}

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !product) {
      toast.error("Please fill in all fields");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          product_id: product.id,
          product_name: product.name,
          amount: product.price,
          customer_email: customerEmail,
          customer_name: customerName,
        });

      if (error) throw error;

      toast.success("Order placed successfully! Check your email for details.");
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
            
            <div className="flex gap-4 items-center pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{product.name}</h2>
                <p className="text-xl font-bold text-foreground mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={processing}
              >
                {processing ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </div>
      </main>
    </div>
  );
};

export default Checkout;
