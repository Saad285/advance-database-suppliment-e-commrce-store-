"use client";

import { useState } from "react";
import { updateSetting } from "@/app/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: any[];
}) {
  const [settings, setSettings] = useState<Record<string, string>>(
    initialSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setIsSubmitting(true);
    try {
      await updateSetting(key, settings[key]);
      toast.success(`Setting '${key}' updated successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${key}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 max-w-xl pb-6 border-b border-border">
        <div>
          <Label htmlFor="shipping_fee" className="text-foreground font-normal">
            Standard Shipping Fee (Rs.)
          </Label>
          <p className="text-sm text-muted-foreground/80 mb-2">
            This flat rate will be applied to all cash-on-delivery orders.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="shipping_fee"
            value={settings["shipping_fee"] || ""}
            onChange={(e) => handleChange("shipping_fee", e.target.value)}
            className="bg-card border-border text-foreground focus:border-primary/50"
          />
          <Button
            onClick={() => handleSave("shipping_fee")}
            disabled={isSubmitting}
            className="shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-sm"
          >
            Update
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-xl pb-6 border-b border-border">
        <div>
          <Label htmlFor="site_name" className="text-foreground font-normal">
            Store Name
          </Label>
          <p className="text-sm text-muted-foreground/80 mb-2">
            The name of your brand displayed across the site.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="site_name"
            value={settings["site_name"] || ""}
            onChange={(e) => handleChange("site_name", e.target.value)}
            className="bg-card border-border text-foreground focus:border-primary/50"
          />
          <Button
            onClick={() => handleSave("site_name")}
            disabled={isSubmitting}
            className="shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-sm"
          >
            Update
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-xl">
        <div>
          <Label
            htmlFor="free_shipping_above"
            className="text-foreground font-normal"
          >
            Free Shipping Threshold (Rs.)
          </Label>
          <p className="text-sm text-muted-foreground/80 mb-2">
            Orders above this subtotal will receive free shipping.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            id="free_shipping_above"
            value={settings["free_shipping_above"] || ""}
            onChange={(e) =>
              handleChange("free_shipping_above", e.target.value)
            }
            className="bg-card border-border text-foreground focus:border-primary/50"
          />
          <Button
            onClick={() => handleSave("free_shipping_above")}
            disabled={isSubmitting}
            className="shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-sm"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}
