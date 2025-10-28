-- Create storage bucket for product images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage bucket for digital files (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'digital-products',
  'digital-products',
  false,
  104857600
);

-- RLS policies for product images (public read, anyone can upload)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- RLS policies for digital products (private - only accessible after purchase)
CREATE POLICY "Anyone can upload digital products"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'digital-products');