import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  store_name: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function Store() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [username]);

  const fetchStoreData = async () => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("store_url", username)
      .single();

    if (profileError || !profileData) {
      console.error("Store not found");
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: false });

    if (!productsError) {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Store not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile.display_name?.[0] || profile.username[0]}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold mb-2">
            {profile.store_name || profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{profile.bio}</p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{product.name}</h3>
                    <p className="font-bold text-primary">${product.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
