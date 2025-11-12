import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, File, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { productSchema, imageFileSchema, digitalFileSchema } from "@/lib/validations";
import { uploadProductImage, uploadDigitalProduct } from "@/lib/storage";
import { z } from "zod";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [whopPlanId, setWhopPlanId] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [digitalFileName, setDigitalFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      imageFileSchema.parse({ file });
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      e.target.value = '';
    }
  };

  const handleDigitalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      digitalFileSchema.parse({ file });
      setDigitalFile(file);
      setDigitalFileName(file.name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a product image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate form data
      const priceNum = parseFloat(price);
      productSchema.parse({
        name: name.trim(),
        price: priceNum,
        description: description.trim(),
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create products");
        navigate("/auth");
        return;
      }

      // Upload image
      const imageUrl = await uploadProductImage(imageFile);

      // Upload digital file if provided
      let digitalFileUrl: string | null = null;
      if (digitalFile) {
        digitalFileUrl = await uploadDigitalProduct(digitalFile);
      }

      // Insert product into database
      const { error } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          price: priceNum,
          description: description.trim(),
          image_url: imageUrl,
          digital_file_url: digitalFileUrl,
          whop_plan_id: whopPlanId.trim() || null,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Product created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create product");
      }
    } finally {
      setIsSubmitting(false);
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
              <label className="text-sm text-muted-foreground mb-2 block">
                Whop Plan ID (Required for Payments)
              </label>
              <Input
                placeholder="plan_XXXXXXXXX"
                value={whopPlanId}
                onChange={(e) => setWhopPlanId(e.target.value)}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your plan ID from your Whop dashboard. Without this, customers won't be able to purchase.
              </p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
