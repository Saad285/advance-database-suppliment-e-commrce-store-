import { createServerSupabase } from "@/lib/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createServerSupabase();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name");

  return (
    <div>
      <CategoryManager initialCategories={categories || []} />
    </div>
  );
}
