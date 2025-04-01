import nodemailer from 'nodemailer';
import { NoteListing } from '@shared/models';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendSearchAlert(userEmail: string, matches: NoteListing[]) {
    const html = `
      <h2>New Matching Notes Found</h2>
      <p>We found ${matches.length} new notes matching your search criteria:</p>
      ${matches.map(note => `
        <div style="margin-bottom: 20px;">
          <h3>${note.title}</h3>
          <p>Price: $${note.askingPrice.toLocaleString()}</p>
          <p>Location: ${note.propertyCity}, ${note.propertyState}</p>
          <p>Type: ${note.noteType}</p>
          <a href="${process.env.FRONTEND_URL}/note/${note.id}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
            View Note Details
          </a>
        </div>
      `).join('')}
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: 'New Notes Matching Your Search',
      html
    });
  }
}; 