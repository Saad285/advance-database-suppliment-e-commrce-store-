"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCategory(formData: FormData) {
  const supabase = await createServerSupabase();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const image_url = formData.get("image_url") as string | null;

  if (!name || !slug) {
    throw new Error("Category Name and Slug are required.");
  }

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    image_url,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createServerSupabase();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const image_url = formData.get("image_url") as string | null;

  if (!id || !name || !slug) {
    throw new Error("Category ID, Name, and Slug are required.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      image_url,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = await createServerSupabase();

  if (!id) {
    throw new Error("Category ID is required.");
  }

  // Check if there are any products in this category before deleting
  const { data: products, error: checkError } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (products && products.length > 0) {
    throw new Error("Cannot delete category because it has products. Reassign or delete the products first.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
