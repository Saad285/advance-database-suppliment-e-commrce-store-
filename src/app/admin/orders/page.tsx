import { createServerSupabase } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import OrderFilters from "@/components/admin/OrderFilters";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    timeframe?: string;
    payment?: string;
    sort?: string;
  }>;
}) {
  const supabase = await createServerSupabase();
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || "all";
  const searchFilter = resolvedParams.search || "";
  const timeframeFilter = resolvedParams.timeframe || "all";
  const paymentFilter = resolvedParams.payment || "all";
  const sortFilter = resolvedParams.sort || "newest";

  let query = supabase.from("orders").select("*, order_items(count)");

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchFilter) {
    const cleanSearch = searchFilter.startsWith("#")
      ? searchFilter.slice(1)
      : searchFilter;
    query = query.or(
      `delivery_name.ilike.%${cleanSearch}%,delivery_city.ilike.%${cleanSearch}%,delivery_phone.ilike.%${cleanSearch}%`,
    );
  }

  if (timeframeFilter && timeframeFilter !== "all") {
    const now = new Date();
    if (timeframeFilter === "today") {
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
      query = query.gte("created_at", todayStart);
    } else if (timeframeFilter === "yesterday") {
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
      const yesterdayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      ).toISOString();
      query = query
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart);
    } else if (timeframeFilter === "7days") {
      const sevenDaysAgo = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      query = query.gte("created_at", sevenDaysAgo);
    } else if (timeframeFilter === "30days") {
      const thirtyDaysAgo = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      query = query.gte("created_at", thirtyDaysAgo);
    }
  }

  if (paymentFilter && paymentFilter !== "all") {
    query = query.eq("payment_method", paymentFilter);
  }

  if (sortFilter === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sortFilter === "total_desc") {
    query = query.order("total", { ascending: false });
  } else if (sortFilter === "total_asc") {
    query = query.order("total", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: orders } = await query;

  return (
    <div>
      <h1 className="text-3xl font-light text-foreground mb-8">Orders</h1>

      <OrderFilters
        currentStatus={statusFilter}
        search={searchFilter}
        timeframe={timeframeFilter}
        payment={paymentFilter}
        sort={sortFilter}
      />

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Total</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-border hover:bg-secondary/40"
                >
                  <TableCell className="font-mono text-foreground font-semibold">
                    #{order.id.split("-")[0]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {order.delivery_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.delivery_city}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    Rs. {Number(order.total).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-none capitalize ${
                        order.status === "delivered"
                          ? "bg-green-500/10 text-green-600"
                          : order.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : order.status === "shipped"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:underline text-sm font-semibold"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground font-light"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
