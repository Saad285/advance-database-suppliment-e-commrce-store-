import { createServerSupabase } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageFormModal from "@/components/admin/PageFormModal";
import DeletePageButton from "@/components/admin/DeletePageButton";

export const dynamic = "force-dynamic";

export default async function AdminPagesDashboard() {
  const supabase = await createServerSupabase();

  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  // Graceful degradation if table doesn't exist yet
  const safePages = error ? [] : pages || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-foreground">Content Pages</h1>
        <PageFormModal />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-sm">
          Please run the seed_cms.sql script in your Supabase dashboard to
          initialize the pages table.
        </div>
      )}

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">
                Slug / URL
              </TableHead>
              <TableHead className="text-muted-foreground">
                Last Updated
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safePages.length > 0 ? (
              safePages.map((page: any) => (
                <TableRow
                  key={page.id}
                  className="border-border hover:bg-secondary/40"
                >
                  <TableCell className="font-medium text-foreground">
                    {page.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{page.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(
                      page.updated_at || page.created_at,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-4">
                      <PageFormModal page={page} />
                      <DeletePageButton id={page.id} title={page.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-muted-foreground font-light"
                >
                  No pages found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
