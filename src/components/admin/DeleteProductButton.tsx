"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/deleteProduct";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${productName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-500/10 disabled:opacity-50"
      title="Delete Product"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
