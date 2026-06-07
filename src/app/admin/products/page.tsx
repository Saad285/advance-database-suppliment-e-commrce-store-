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
import AddProductButton from "@/components/admin/AddProductButton";
import EditProductButton from "@/components/admin/EditProductButton";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createServerSupabase();

  // Fetch products and categories for CRUD creation modal dropdown
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-foreground">Products</h1>
        <AddProductButton categories={categories || []} />
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow
                key={product.id}
                className="border-border hover:bg-secondary/40"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-muted rounded border border-border overflow-hidden">
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
                <TableCell className="text-foreground/90">
                  {product.stock_qty}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.is_active ? "default" : "destructive"}
                    className="border-none"
                  >
                    {product.is_active ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <EditProductButton
                      product={product}
                      categories={categories || []}
                    />
                    <DeleteProductButton
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
