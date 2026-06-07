"use client";

import { useState } from "react";
import { createPage, updatePage } from "@/app/actions/cms";
import { toast } from "sonner";
import { Plus, X, Pencil } from "lucide-react";

interface PageFormModalProps {
  page?: any;
}

export default function PageFormModal({ page }: PageFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!page;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (isEditing) {
        await updatePage(page.id, formData);
        toast.success("Page updated successfully!");
      } else {
        await createPage(formData);
        toast.success("Page created successfully!");
      }
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isEditing ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 rounded-sm"
        >
          <Plus className="w-4 h-4" /> Add Page
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-light text-foreground">
                {isEditing ? "Edit Page" : "Add New Page"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id={`page-form-${page?.id || "new"}`}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                    Page Title
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={page?.title || ""}
                    placeholder="e.g. Terms of Service"
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                    URL Slug
                  </label>
                  <input
                    name="slug"
                    required
                    defaultValue={page?.slug || ""}
                    placeholder="e.g. terms-of-service"
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5 font-medium">
                    Content (HTML allowed)
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={12}
                    defaultValue={page?.content || ""}
                    placeholder="<h1>Terms of Service</h1><p>Welcome to our store...</p>"
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-mono"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-foreground border border-border hover:bg-secondary rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form={`page-form-${page?.id || "new"}`}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
