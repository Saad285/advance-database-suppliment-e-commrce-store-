"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

interface OrderFiltersProps {
  currentStatus: string;
  search: string;
  timeframe: string;
  payment: string;
  sort: string;
  minTotal?: string;
  maxTotal?: string;
  province?: string;
}

export default function OrderFilters({
  currentStatus,
  search,
  timeframe,
  payment,
  sort,
  minTotal = "",
  maxTotal = "",
  province = "all",
}: OrderFiltersProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state if search filter changes externally
  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams();

    // Base params
    const newSearch =
      updates.search !== undefined ? updates.search : searchTerm;
    const newStatus =
      updates.status !== undefined ? updates.status : currentStatus;
    const newTimeframe =
      updates.timeframe !== undefined ? updates.timeframe : timeframe;
    const newPayment =
      updates.payment !== undefined ? updates.payment : payment;
    const newSort = updates.sort !== undefined ? updates.sort : sort;
    const newMinTotal =
      updates.minTotal !== undefined ? updates.minTotal : minTotal;
    const newMaxTotal =
      updates.maxTotal !== undefined ? updates.maxTotal : maxTotal;
    const newProvince =
      updates.province !== undefined ? updates.province : province;

    if (newSearch) params.set("search", newSearch);
    if (newStatus && newStatus !== "all") params.set("status", newStatus);
    if (newTimeframe && newTimeframe !== "all")
      params.set("timeframe", newTimeframe);
    if (newPayment && newPayment !== "all") params.set("payment", newPayment);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (newMinTotal) params.set("minTotal", newMinTotal);
    if (newMaxTotal) params.set("maxTotal", newMaxTotal);
    if (newProvince && newProvince !== "all")
      params.set("province", newProvince);

    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchTerm });
  };

  const handleClear = () => {
    setSearchTerm("");
    router.push("/admin/orders");
  };

  const hasAdvancedFilters =
    timeframe !== "all" ||
    payment !== "all" ||
    sort !== "newest" ||
    minTotal ||
    maxTotal ||
    province !== "all";

  return (
    <div className="space-y-4 mb-8 bg-card border border-border p-4 rounded-sm">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search Field */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full lg:max-w-xs flex items-center"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Name, City, Phone..."
            className="w-full bg-background border border-border rounded-sm pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
        </form>

        {/* Status Tabs */}
        <div className="flex gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "confirmed", label: "Confirmed" },
            { key: "shipped", label: "Shipped" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => {
            const isActive = currentStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => applyFilters({ status: tab.key })}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors shrink-0 border ${
                  isActive
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Toggle & Clear Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-sm text-xs font-medium transition-colors ${
              showAdvanced || hasAdvancedFilters
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {(searchTerm || currentStatus !== "all" || hasAdvancedFilters) && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Collapsible Panel */}
      {(showAdvanced || hasAdvancedFilters) && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 pt-4 border-t border-border bg-muted/10 p-3 rounded-sm">
          {/* Province */}
          <div className="col-span-2 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Province
            </label>
            <select
              value={province}
              onChange={(e) => applyFilters({ province: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Provinces</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="KPK">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Gilgit Baltistan">Gilgit Baltistan</option>
              <option value="AJK">AJK</option>
            </select>
          </div>

          {/* Amount Min */}
          <div className="col-span-1 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Min Total (Rs)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minTotal}
              onBlur={(e) => applyFilters({ minTotal: e.target.value })}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                applyFilters({ minTotal: e.currentTarget.value })
              }
              onChange={(e) => {
                /* Only apply on blur/enter to avoid spamming URL */
              }}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Amount Max */}
          <div className="col-span-1 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Max Total (Rs)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={maxTotal}
              onBlur={(e) => applyFilters({ maxTotal: e.target.value })}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                applyFilters({ maxTotal: e.currentTarget.value })
              }
              onChange={(e) => {}}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Timeframe Dropdown */}
          <div className="col-span-2 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Order Date
            </label>
            <select
              value={timeframe}
              onChange={(e) => applyFilters({ timeframe: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="col-span-2 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Payment Method
            </label>
            <select
              value={payment}
              onChange={(e) => applyFilters({ payment: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Payment Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Card">Card / Digital Payment</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-2 lg:col-span-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="total_desc">Total: High to Low</option>
              <option value="total_asc">Total: Low to High</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
