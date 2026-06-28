"use client";

import { useState } from "react";
import { recoverProduct } from "@/app/actions/recoverProduct";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export default function RecoverProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecover = async () => {
    if (!confirm(`Are you sure you want to recover ${productName}?`)) {
      return;
    }

    setIsRecovering(true);
    try {
      await recoverProduct(productId);
      toast.success("Product recovered successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to recover product");
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <button
      onClick={handleRecover}
      disabled={isRecovering}
      className="text-green-500 hover:text-green-700 transition-colors p-1.5 rounded hover:bg-green-500/10 disabled:opacity-50"
      title="Recover Product"
    >
      <RotateCcw className="w-4 h-4" />
    </button>
  );
}
