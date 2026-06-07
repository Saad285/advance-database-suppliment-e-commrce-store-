"use client";

import { useState } from "react";
import { deletePage } from "@/app/actions/cms";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function DeletePageButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the page "${title}"?`))
      return;

    setIsDeleting(true);
    try {
      await deletePage(id);
      toast.success("Page deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete Page"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
