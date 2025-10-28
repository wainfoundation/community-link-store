import { z } from "zod";

export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  price: z.number()
    .positive("Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  description: z.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
});

export const orderSchema = z.object({
  customerName: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  customerEmail: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
});

export const imageFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only JPEG, PNG, WEBP, and GIF images are allowed"
    ),
});

export const digitalFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, "File must be less than 100MB"),
});
