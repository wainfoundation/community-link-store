import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { mockProducts, deleteProduct } from "@/lib/mockData";

const Dashboard = () => {
  const [products, setProducts] = useState(mockProducts);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts([...mockProducts]);
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

        {products.length === 0 ? (
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
                product={product}
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
