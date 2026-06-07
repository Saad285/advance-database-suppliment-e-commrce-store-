"use client";

import { useState } from "react";
import { updateProduct } from "@/app/actions/product";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";

interface EditProductButtonProps {
  product: any;
  categories: any[];
}

export default function EditProductButton({
  product,
  categories,
}: EditProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updateProduct(product.id, formData);
      toast.success("Product updated successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        title="Edit Product"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-card border border-border w-full max-w-lg rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-lg font-light text-foreground">
                Edit Product: {product.name}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Product Name *
                </label>
                <input
                  name="name"
                  defaultValue={product.name}
                  required
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="e.g. Magnesium Glycinate 400mg"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Product Slug *
                </label>
                <input
                  name="slug"
                  defaultValue={product.slug}
                  required
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="e.g. magnesium-glycinate-400mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    defaultValue={product.category_id || ""}
                    required
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    name="stock_qty"
                    type="number"
                    defaultValue={product.stock_qty}
                    required
                    min="0"
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Price (Rs.) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={product.price}
                    required
                    min="0"
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="3500"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Compare at Price (Rs.)
                  </label>
                  <input
                    name="compare_at_price"
                    type="number"
                    defaultValue={product.compare_at_price || ""}
                    min="0"
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="4200"
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 bg-muted/20 border border-border/80 rounded-sm">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                    Upload Image File (JPG, JPEG, PNG, WEBP)
                  </label>
                  <input
                    type="file"
                    name="image_file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="w-full bg-background border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 file:mr-3 file:py-1 file:px-2.5 file:border file:border-border file:rounded-sm file:text-xs file:bg-secondary file:text-secondary-foreground file:hover:bg-secondary/80 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-light">
                    or
                  </span>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                    Image URL
                  </label>
                  <input
                    name="image_url"
                    defaultValue={product.images?.[0] || ""}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={product.description || ""}
                  rows={2}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Provide supplement details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    How To Use
                  </label>
                  <input
                    name="how_to_use"
                    defaultValue={product.how_to_use || ""}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Take 2 capsules before bed..."
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Ingredients
                  </label>
                  <input
                    name="ingredients"
                    defaultValue={product.ingredients || ""}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Magnesium Glycinate..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Featured Product
                  </label>
                  <select
                    name="is_featured"
                    defaultValue={product.is_featured ? "true" : "false"}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Status (Active/Draft)
                  </label>
                  <select
                    name="is_active"
                    defaultValue={product.is_active ? "true" : "false"}
                    className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="true">Active (Visible to shop)</option>
                    <option value="false">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-border text-sm text-foreground hover:bg-muted/50 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/95 transition-colors rounded-sm disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
