import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendOrderConfirmationEmail = async (
  toEmail: string, 
  orderData: any, 
  items: any[],
  orderId: string
) => {
  // Wait gracefully if env vars are missing so the build doesn't crash
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Gmail SMTP credentials not set. Skipping email.')
    return
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">Rs. ${item.unit_price}</td>
    </tr>
  `).join('')

  const confirmUrl = `http://localhost:3000/api/confirm-order?id=${orderId}&action=confirm`;
  const cancelUrl = `http://localhost:3000/api/confirm-order?id=${orderId}&action=cancel`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px; background-color: #000; color: #fff;">
        <h1 style="margin: 0; letter-spacing: 2px;">IRONROOTS</h1>
      </div>
      
      <div style="padding: 30px 20px; border: 1px solid #eaeaea;">
        <h2 style="margin-top: 0;">Order Confirmation</h2>
        <p>Dear ${orderData.delivery_name},</p>
        <p>Thank you for your order! We are preparing it for dispatch.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #000; margin: 25px 0; text-align: center;">
          <h3 style="margin-top: 0;">Please confirm your order</h3>
          <p style="margin-bottom: 20px;">Click one of the buttons below to process your order automatically.</p>
          <a href="${confirmUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 25px; margin-right: 10px; font-weight: bold; border-radius: 4px;">Confirm Order</a>
          <a href="${cancelUrl}" style="display: inline-block; background-color: #dc2626; color: #fff; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 4px;">Cancel Order</a>
        </div>

        <h3 style="margin-top: 30px; border-bottom: 2px solid #000; padding-bottom: 5px;">Delivery Details</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${orderData.delivery_address}</p>
        <p style="margin: 5px 0;"><strong>City:</strong> ${orderData.delivery_city}, ${orderData.delivery_province}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.delivery_phone}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>

        <h3 style="margin-top: 30px; border-bottom: 2px solid #000; padding-bottom: 5px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eaeaea;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #eaeaea;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eaeaea;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">Rs. ${orderData.subtotal}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
              <td style="padding: 10px; text-align: right;">Rs. ${orderData.shipping_fee}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Rs. ${orderData.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 40px; font-size: 0.9em; color: #666; text-align: center;">
          If you have any questions, please reply to this email.
        </p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"IRONROOTS" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmation - IRONROOTS`,
    html,
  })
}
