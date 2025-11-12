import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  digital_file_url: string | null;
  whop_plan_id: string | null;
  user_id: string;
}

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleComplete = () => {
    toast.success("Payment completed successfully!");
    navigate("/discover");
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

            {product.whop_plan_id ? (
              <div className="mt-6">
                <WhopCheckoutEmbed 
                  planId={product.whop_plan_id} 
                  onComplete={handleComplete}
                  skipRedirect={true}
                />
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Powered by Whop - Secure payment processing
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  This product doesn't have a Whop payment plan configured yet.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Please contact the seller to set up payment processing.
                </p>
                <p className="text-xs text-muted-foreground">
                  Product ID: {product.id}
                </p>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default Checkout;
