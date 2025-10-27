import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getProductById } from "@/lib/mockData";
import { toast } from "sonner";

const ProductDetail = () => {
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

  const handleBuyNow = () => {
    toast.info("Payment integration will be set up later");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-card border border-border">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  * Additional fees may be applied at checkout
                </p>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                onClick={handleBuyNow}
              >
                Buy now
              </Button>
            </div>

            <Card className="p-6 bg-card border-border">
              <h2 className="font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
