import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getProductById } from "@/lib/mockData";
import { toast } from "sonner";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : undefined;

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

  const handleCheckout = () => {
    toast.info("Payment integration will be set up later");
  };

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
                src={product.imageUrl}
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

          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Payment processing will be available soon. You'll be able to complete your purchase once payment integration is set up.
            </p>
            
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              onClick={handleCheckout}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
