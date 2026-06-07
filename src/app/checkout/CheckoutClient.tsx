"use client";

import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitOrder } from "@/app/actions/checkout";
import { toast } from "sonner";
import { ArrowRight, Truck, CreditCard } from "lucide-react";

export default function CheckoutClient({
  userId,
  shippingFee,
  defaultAddress,
  dbProvinces = [],
  dbCities = [],
}: {
  userId: string;
  shippingFee: number;
  defaultAddress: any;
  dbProvinces?: any[];
  dbCities?: any[];
}) {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    deliveryName: defaultAddress?.full_name || "",
    deliveryPhone: defaultAddress?.phone || "",
    deliveryAddress: defaultAddress?.address_line || "",
    deliveryCity: defaultAddress?.city || "",
    deliveryProvince: defaultAddress?.province || "",
    notes: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleProvinceChange = (provinceName: string) => {
    update("deliveryProvince", provinceName);
    update("deliveryCity", ""); // Reset city when province changes
  };

  const handleCityChange = (cityName: string) => {
    update("deliveryCity", cityName);
  };

  const subtotal = totalPrice();
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="py-28 text-center bg-background">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <button
          onClick={() => router.push("/products")}
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to shop
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate serviceability if db is in use
      if (dbCities.length > 0) {
        const selectedCity = dbCities.find((c) => c.name === form.deliveryCity);
        if (selectedCity && !selectedCity.is_serviceable) {
          throw new Error(
            `Delivery is not available in ${form.deliveryCity} by our courier partners.`,
          );
        }
      }

      const orderId = await submitOrder({
        userId,
        ...form,
        items,
      });
      clearCart();
      toast.success("Order placed successfully");
      router.push(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
      setIsSubmitting(false);
    }
  };

  // Determine available cities based on selected province
  const selectedProvinceObj = dbProvinces.find(
    (p) => p.name === form.deliveryProvince,
  );
  const availableCities = selectedProvinceObj
    ? dbCities.filter((c) => c.province_id === selectedProvinceObj.id)
    : [];

  const currentCityObj = dbCities.find((c) => c.name === form.deliveryCity);
  const isServiceable = currentCityObj ? currentCityObj.is_serviceable : true;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 bg-background">
      <div className="lg:col-span-3">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={form.deliveryName}
                  onChange={(e) => update("deliveryName", e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Phone (11 Digits)
                </label>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{11}"
                  title="Phone number must be exactly 11 digits"
                  value={form.deliveryPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Strip non-digits
                    if (val.length <= 11) update("deliveryPhone", val);
                  }}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="03001234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Address (No Special Characters)
                </label>
                <input
                  required
                  pattern="^[a-zA-Z0-9\s,.-]+$"
                  title="Address can only contain letters, numbers, spaces, commas, and periods"
                  value={form.deliveryAddress}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only allow letters, numbers, spaces, commas, periods, and hyphens
                    if (/^[a-zA-Z0-9\s,.-]*$/.test(val)) {
                      update("deliveryAddress", val);
                    }
                  }}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="House 123, Street 4, Phase 5"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Province
                </label>
                {dbProvinces.length > 0 ? (
                  <select
                    required
                    value={form.deliveryProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                  >
                    <option value="" disabled>
                      Select Province
                    </option>
                    {dbProvinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={form.deliveryProvince}
                    onChange={(e) => update("deliveryProvince", e.target.value)}
                    className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  City
                </label>
                {dbProvinces.length > 0 ? (
                  <select
                    required
                    value={form.deliveryCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!form.deliveryProvince}
                    className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {availableCities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {!c.is_serviceable ? "(Not Serviceable)" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={form.deliveryCity}
                    onChange={(e) => update("deliveryCity", e.target.value)}
                    className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="e.g. Peshawar, Karachi, Lahore"
                  />
                )}
                {!isServiceable && (
                  <p className="text-xs text-red-500 mt-1.5">
                    * Courier partners do not currently deliver to{" "}
                    {form.deliveryCity}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Payment
            </h2>
            <div className="border border-primary/20 bg-primary/[0.03] px-5 py-3.5">
              <p className="text-sm font-medium text-primary">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Pay in cash when the order is delivered.
              </p>
            </div>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 bg-card border border-border p-8">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-8">
            Order
          </h2>

          <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between items-start gap-3"
              >
                <div>
                  <p className="text-sm text-foreground line-clamp-1">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    × {item.quantity}
                  </p>
                </div>
                <span className="text-sm text-foreground shrink-0 font-medium">
                  Rs. {(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground font-medium">
                Rs. {shippingFee.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-8">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-medium text-foreground">
                Rs. {total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Confirm Order"}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
