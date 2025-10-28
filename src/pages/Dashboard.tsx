import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteProductImage, deleteDigitalProduct } from "@/lib/storage";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  digital_file_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the product to get file URLs
      const product = products.find(p => p.id === id);
      
      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete associated files from storage
      if (product) {
        try {
          if (product.image_url) {
            await deleteProductImage(product.image_url);
          }
          if (product.digital_file_url) {
            await deleteDigitalProduct(product.digital_file_url);
          }
        } catch (storageError) {
          console.error("Error deleting files:", storageError);
          // Don't show error to user as product is already deleted
        }
      }

      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8">
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </Link>
          
          <Link to="/orders">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              See Orders
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2 text-foreground">No products yet</h2>
            <p className="text-muted-foreground mb-6">Create your first product to get started</p>
            <Link to="/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  imageUrl: product.image_url,
                  digitalFileUrl: product.digital_file_url || undefined,
                  createdAt: new Date(product.created_at),
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
