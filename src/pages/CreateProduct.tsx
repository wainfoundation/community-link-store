import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, File } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [digitalFileName, setDigitalFileName] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDigitalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDigitalFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || !imagePreview) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (priceNum <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name,
          price: priceNum,
          description,
          image_url: imagePreview,
          digital_file_url: digitalFileName || null,
        });

      if (error) throw error;

      toast.success("Product created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
            <Card className="aspect-square bg-card border-border flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-3">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload product image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
              <Input
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Price</label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-input border-border"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                * Fees may be applied by payment processor
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Description</label>
              <Textarea
                placeholder="Product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <div>
              <label className="cursor-pointer flex items-center gap-3 p-4 border border-border rounded-lg bg-input hover:bg-secondary transition-colors">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    {digitalFileName || "Upload digital product"}
                  </p>
                  {digitalFileName && (
                    <p className="text-xs text-muted-foreground mt-1">File selected</p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleDigitalFileUpload}
                />
              </label>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              onClick={handleSubmit}
            >
              Create Product
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
