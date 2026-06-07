import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  if (!id || !action) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const supabase = createAdminClient();
  const status = action === 'confirm' ? 'processing' : 'cancelled';

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    return new NextResponse(`Error updating order: ${error.message}`, { status: 500 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order ${action === 'confirm' ? 'Confirmed' : 'Cancelled'}</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: ${action === 'confirm' ? '#16a34a' : '#dc2626'}; margin-top: 0;">
            Order ${action === 'confirm' ? 'Confirmed' : 'Cancelled'}!
          </h1>
          <p style="font-size: 1.1em;">Your order status has been successfully updated to <strong>${status}</strong> in our database.</p>
          <p style="color: #666; margin-top: 30px; font-size: 0.9em;">You can close this tab and return to the store.</p>
          <a href="http://localhost:3000" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #fff; background: #000; padding: 10px 20px; border-radius: 4px;">Return to Shop</a>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
