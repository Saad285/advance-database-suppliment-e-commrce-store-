"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recoverProduct(id: string) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("products")
    .update({ is_active: true, deleted_at: null })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
