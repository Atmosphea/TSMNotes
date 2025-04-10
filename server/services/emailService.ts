
import nodemailer from 'nodemailer';
import { type Inquiry } from '@shared/models';
import { userService } from './userService';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const emailService = {
  async sendInquiryNotification(inquiry: Inquiry) {
    const seller = await userService.getUserById(inquiry.sellerId);
    const buyer = await userService.getUserById(inquiry.buyerId);
    
    if (!seller || !buyer) return;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: seller.email,
      subject: 'New Inquiry Received',
      html: `
        <h2>New Inquiry Received</h2>
        <p>You have received a new inquiry from ${buyer.firstName} ${buyer.lastName}</p>
        <p>${inquiry.message}</p>
        ${inquiry.offerAmount ? `<p>Offer Amount: $${inquiry.offerAmount}</p>` : ''}
      `
    });
  },

  async sendInquiryResponseNotification(inquiry: Inquiry) {
    const buyer = await userService.getUserById(inquiry.buyerId);
    if (!buyer) return;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: buyer.email,
      subject: 'Inquiry Response Received',
      html: `
        <h2>Response to Your Inquiry</h2>
        <p>Status: ${inquiry.status}</p>
        <p>Response: ${inquiry.responseMessage}</p>
      `
    });
  }
};
