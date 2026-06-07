"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createPage(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;

  if (!title || !slug || !content) {
    throw new Error("Title, slug, and content are required.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("pages").insert({
    title,
    slug: slug.toLowerCase().replace(/\s+/g, "-"),
    content,
  });

  if (error) {
    if (error.code === "23505")
      throw new Error("A page with this slug already exists.");
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;

  if (!title || !slug || !content) {
    throw new Error("Title, slug, and content are required.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("pages")
    .update({
      title,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
}

export async function deletePage(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("pages").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/pages");
}
