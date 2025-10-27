import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onDelete }: ProductCardProps) => {
  const productLink = `${window.location.origin}/product/${product.id}`;
  const checkoutLink = `${window.location.origin}/checkout/${product.id}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="overflow-hidden bg-card border-border relative group">
      <button
        onClick={() => onDelete(product.id)}
        className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete product"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-card-foreground">{product.name}</h3>
        </Link>
        
        <p className="text-xl font-bold text-card-foreground">
          ${product.price.toFixed(2)}
        </p>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => copyToClipboard(productLink, "Product link")}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Product Link
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => copyToClipboard(checkoutLink, "Checkout link")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Checkout Link
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
