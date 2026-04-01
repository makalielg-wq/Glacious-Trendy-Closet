export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (email: string, orderId: string, items: any[], total: number) => {
  const itemsHtml = items.map(item => `
    <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #eee;">
      <strong>${item.name}</strong><br/>
      Size: ${item.selectedSize} | Color: ${item.selectedColor}<br/>
      Quantity: ${item.quantity} | Price: $${item.price}
    </div>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #ec4899; text-align: center;">Order Confirmed!</h1>
      <p>Hi there,</p>
      <p>Thank you for shopping with <strong>Glacious Trendy Closet</strong>! Your order has been successfully placed.</p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h2 style="margin-top: 0; font-size: 18px;">Order Summary</h2>
        <p><strong>Order ID:</strong> #${orderId.toUpperCase()}</p>
        ${itemsHtml}
        <div style="margin-top: 15px; text-align: right;">
          <strong style="font-size: 20px; color: #ec4899;">Total: $${total.toFixed(2)}</strong>
        </div>
      </div>

      <p>We'll notify you as soon as your trendy items are on their way!</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        &copy; 2026 Glacious Trendy Closet. Stay Fabulous.
      </div>
    </div>
  `;

  return sendEmail(email, `Order Confirmation - #${orderId.toUpperCase()}`, html);
};

export const sendShipmentNotificationEmail = async (email: string, orderId: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #ec4899; text-align: center;">Your Order is on its Way!</h1>
      <p>Great news!</p>
      <p>Your order <strong>#${orderId.toUpperCase()}</strong> from <strong>Glacious Trendy Closet</strong> has been shipped and is heading to you.</p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <p>Get ready to rock your new styles!</p>
      </div>

      <p>You can track your order status in your profile history.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        &copy; 2026 Glacious Trendy Closet. Stay Fabulous.
      </div>
    </div>
  `;

  return sendEmail(email, `Your Order #${orderId.toUpperCase()} has Shipped!`, html);
};
