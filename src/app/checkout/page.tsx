import { createServerSupabase } from "@/lib/supabase/server";
import CheckoutClient from "./CheckoutClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account?redirect=/checkout");
  }

  const { data: settingData } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "shipping_fee")
    .single();

  const shippingFee = settingData ? parseInt(settingData.value, 10) : 200;

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  // Gracefully fetch provinces and cities (won't crash if user hasn't ran seed_locations.sql yet)
  const { data: provinces, error: provError } = await supabase
    .from("provinces")
    .select("*")
    .order("name");
  const { data: cities, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-28">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">
        Checkout
      </p>
      <h1 className="text-3xl font-light text-white tracking-tight mb-10">
        Complete your order
      </h1>
      <CheckoutClient
        userId={user.id}
        shippingFee={shippingFee}
        defaultAddress={address || null}
        dbProvinces={provError ? [] : provinces || []}
        dbCities={cityError ? [] : cities || []}
      />
    </div>
  );
}
