import { createServerSupabase } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabase();

  const { data: settings } = await supabase.from("settings").select("*");

  return (
    <div>
      <h1 className="text-3xl font-light text-foreground mb-8">
        Store Settings
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage global store configurations like shipping fee and free shipping
        thresholds.
      </p>

      <div className="bg-card border border-border rounded-sm p-6 md:p-8">
        <SettingsClient initialSettings={settings || []} />
      </div>
    </div>
  );
}
