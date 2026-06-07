"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminOrderStatusClient({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
      setStatus(currentStatus); // revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        value={status}
        onValueChange={(val) => {
          if (val) setStatus(val);
        }}
      >
        <SelectTrigger className="w-full bg-background border-border text-foreground">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border text-foreground">
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleUpdate}
        disabled={isUpdating || status === currentStatus}
        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-sm"
      >
        Update Status
      </Button>
    </div>
  );
}
