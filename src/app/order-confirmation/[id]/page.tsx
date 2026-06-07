import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createServerSupabase();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", resolvedParams.id)
    .single();

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <p className="text-zinc-400 mb-4">Order not found.</p>
        <Link
          href="/"
          className="text-sm text-primary underline underline-offset-4"
        >
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 md:py-28">
      <div className="text-center mb-12">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-6" />
        <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">
          Order Confirmed
        </p>
        <h1 className="text-3xl font-light text-white tracking-tight mb-3">
          Thank you, {order.delivery_name}.
        </h1>
        <p className="text-sm text-zinc-500">
          Order{" "}
          <span className="font-mono text-zinc-400">
            #{order.id.split("-")[0]}
          </span>{" "}
          has been placed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.04] mb-12">
        <div className="bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">
            Delivery
          </p>
          <div className="text-sm text-zinc-300 space-y-1">
            <p>{order.delivery_address}</p>
            <p>
              {order.delivery_city}, {order.delivery_province}
            </p>
            <p>{order.delivery_phone}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">
            Payment
          </p>
          <div className="text-sm text-zinc-300 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Method</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Items</span>
              <span>{order.order_items?.length}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.04] pt-2 mt-2">
              <span className="text-zinc-500">Total</span>
              <span className="text-white font-medium">
                Rs. {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-3 text-sm font-medium hover:bg-zinc-200 transition-colors duration-200"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-zinc-700"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
