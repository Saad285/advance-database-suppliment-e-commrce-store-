"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Helper to save uploaded file locally and return URL
async function saveUploadedFile(file: File): Promise<string | null> {
  if (!file || file.size === 0 || !file.name) {
    return null;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.",
    );
  }

  // Generate unique filename
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

  const supabase = await createServerSupabase();

  // Upload to Supabase Storage Bucket 'product-images'
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase storage upload failed, falling back to local:", error);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  // Get public URL from Supabase storage
  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function addProduct(formData: FormData) {
  const supabase = await createServerSupabase();

  // Retrieve values
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const price = parseFloat(formData.get("price") as string);
  const compare_at_price = formData.get("compare_at_price")
    ? parseFloat(formData.get("compare_at_price") as string)
    : null;
  const stock_qty = parseInt(formData.get("stock_qty") as string, 10);
  const description = formData.get("description") as string;
  const how_to_use = formData.get("how_to_use") as string;
  const ingredients = formData.get("ingredients") as string;
  const image_url = formData.get("image_url") as string;
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";

  // Input Validation
  if (!name || !slug || !category_id || isNaN(price) || isNaN(stock_qty)) {
    throw new Error("Please fill all required fields correctly.");
  }

  // Enforce string validity (must contain at least one letter, no pure number strings)
  const stringRegex = /[a-zA-Z]/;
  if (!stringRegex.test(name))
    throw new Error(
      "Product Name must contain letters (cannot be only numbers).",
    );
  if (!stringRegex.test(slug))
    throw new Error("Product Slug must contain letters.");
  if (description && !stringRegex.test(description))
    throw new Error("Description must contain letters.");
  if (ingredients && !stringRegex.test(ingredients))
    throw new Error("Ingredients must contain letters.");
  if (how_to_use && !stringRegex.test(how_to_use))
    throw new Error("How to Use must contain letters.");

  let final_image = image_url;
  if (image_file && image_file.size > 0) {
    const uploadedUrl = await saveUploadedFile(image_file);
    if (uploadedUrl) {
      final_image = uploadedUrl;
    }
  } else if (image_url) {
    if (!image_url.startsWith("http://") && !image_url.startsWith("https://")) {
      throw new Error("Image URL must start with http:// or https://");
    }
    if (image_url.includes("...")) {
      throw new Error(
        "Please provide a complete, working image URL (not a placeholder with '...').",
      );
    }
  }

  // Insert into products table
  const { error } = await supabase.from("products").insert({
    name,
    slug,
    category_id,
    price,
    compare_at_price,
    stock_qty,
    description,
    how_to_use,
    ingredients,
    images: final_image ? [final_image] : [],
    is_featured,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createServerSupabase();

  // Retrieve values
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const price = parseFloat(formData.get("price") as string);
  const compare_at_price = formData.get("compare_at_price")
    ? parseFloat(formData.get("compare_at_price") as string)
    : null;
  const stock_qty = parseInt(formData.get("stock_qty") as string, 10);
  const description = formData.get("description") as string;
  const how_to_use = formData.get("how_to_use") as string;
  const ingredients = formData.get("ingredients") as string;
  const image_url = formData.get("image_url") as string;
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const is_active = formData.get("is_active") === "true";

  // Input Validation
  if (
    !productId ||
    !name ||
    !slug ||
    !category_id ||
    isNaN(price) ||
    isNaN(stock_qty)
  ) {
    throw new Error("Please fill all required fields correctly.");
  }

  // Enforce string validity
  const stringRegex = /[a-zA-Z]/;
  if (!stringRegex.test(name))
    throw new Error(
      "Product Name must contain letters (cannot be only numbers).",
    );
  if (!stringRegex.test(slug))
    throw new Error("Product Slug must contain letters.");
  if (description && !stringRegex.test(description))
    throw new Error("Description must contain letters.");
  if (ingredients && !stringRegex.test(ingredients))
    throw new Error("Ingredients must contain letters.");
  if (how_to_use && !stringRegex.test(how_to_use))
    throw new Error("How to Use must contain letters.");

  let final_image = image_url;
  if (image_file && image_file.size > 0) {
    const uploadedUrl = await saveUploadedFile(image_file);
    if (uploadedUrl) {
      final_image = uploadedUrl;
    }
  } else if (image_url) {
    if (!image_url.startsWith("http://") && !image_url.startsWith("https://")) {
      throw new Error("Image URL must start with http:// or https://");
    }
    if (image_url.includes("...")) {
      throw new Error(
        "Please provide a complete, working image URL (not a placeholder with '...').",
      );
    }
  }

  // Update in supabase
  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      category_id,
      price,
      compare_at_price,
      stock_qty,
      description,
      how_to_use,
      ingredients,
      images: final_image ? [final_image] : [],
      is_featured,
      is_active,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");
  revalidatePath("/");
}
