import { supabase } from "@/integrations/supabase/client";

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadDigitalProduct(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('digital-products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  return filePath;
}

export async function deleteProductImage(url: string): Promise<void> {
  const path = url.split('/product-images/')[1];
  if (path) {
    await supabase.storage
      .from('product-images')
      .remove([path]);
  }
}

export async function deleteDigitalProduct(path: string): Promise<void> {
  if (path) {
    await supabase.storage
      .from('digital-products')
      .remove([path]);
  }
}
