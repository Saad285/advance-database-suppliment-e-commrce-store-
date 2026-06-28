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
import Image from "next/image";
import RecoverProductButton from "@/components/admin/RecoverProductButton";
import HardDeleteProductButton from "@/components/admin/HardDeleteProductButton";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDraftsPage() {
  const supabase = await createServerSupabase();

  // Fetch only soft-deleted products
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("is_active", false)
    .order("deleted_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-foreground">Drafts / Bin</h1>
      </div>

      <div className="mb-6 p-4 bg-muted/40 border border-border rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          Items here have been soft-deleted and are no longer visible on the store. 
          They will be permanently deleted automatically after 90 days of being in the bin. 
          You can also manually delete them permanently or recover them back to active status.
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Deleted At</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No items in the bin.
                </TableCell>
              </TableRow>
            )}
            {products?.map((product) => (
              <TableRow
                key={product.id}
                className="border-border hover:bg-secondary/40 opacity-70 hover:opacity-100 transition-opacity"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-muted rounded border border-border overflow-hidden grayscale">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex w-full h-full items-center justify-center text-xs text-muted-foreground/60 font-bold">
                          IR
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground/75">
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/90">
                  {product.categories?.name}
                </TableCell>
                <TableCell className="text-foreground/90">
                  Rs. {product.price}
                </TableCell>
                <TableCell className="text-foreground/90 text-sm">
                  {product.deleted_at 
                    ? new Date(product.deleted_at).toLocaleDateString()
                    : "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <RecoverProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                    <HardDeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
