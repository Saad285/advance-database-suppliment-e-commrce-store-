import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createServerSupabase();

  const { data: page } = await supabase
    .from("pages")
    .select("title")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!page) {
    return { title: "Page Not Found | IRONROOTS" };
  }

  return {
    title: `${page.title} | IRONROOTS`,
  };
}

export default async function DynamicCMSPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createServerSupabase();

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <h1 className="text-4xl font-light tracking-wide mb-8">{page.title}</h1>
        {/* Render HTML content safely */}
        <div
          className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>
      <Footer />
    </div>
  );
}
