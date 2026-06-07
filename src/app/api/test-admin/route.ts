import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseAdmin = createAdminClient();

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .limit(1);

  return NextResponse.json({
    products,
    error: error ? error.message : null,
  });
}
