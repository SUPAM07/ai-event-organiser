import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  ignoreTLS: true,
});

export class EmailService {
  async sendWelcome(to: string, name: string): Promise<void> {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: 'Welcome to AI Event Organiser!',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining AI Event Organiser. We're excited to have you!</p>
        <p>Start exploring events or create your own.</p>
      `,
    });
    console.log(`✉️  Welcome email sent to ${to}`);
  }

  async sendTicketConfirmation(
    to: string,
    attendeeName: string,
    eventTitle: string,
    startDate: string,
    qrCode: string
  ): Promise<void> {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Ticket Confirmed: ${eventTitle}`,
      html: `
        <h1>Your Ticket is Confirmed!</h1>
        <p>Hi ${attendeeName},</p>
        <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>QR Code:</strong> ${qrCode}</p>
        <p>See you at the event!</p>
      `,
    });
    console.log(`✉️  Ticket confirmation sent to ${to}`);
  }

  async sendTicketCancellation(
    to: string,
    eventTitle: string
  ): Promise<void> {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Ticket Cancelled: ${eventTitle}`,
      html: `
        <h1>Ticket Cancellation</h1>
        <p>Your ticket for <strong>${eventTitle}</strong> has been cancelled.</p>
        <p>We hope to see you at another event!</p>
      `,
    });
    console.log(`✉️  Cancellation email sent to ${to}`);
  }
}
