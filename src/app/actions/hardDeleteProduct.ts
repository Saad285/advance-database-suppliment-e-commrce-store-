"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function hardDeleteProduct(id: string) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/drafts");
  revalidatePath("/admin/products");
}
