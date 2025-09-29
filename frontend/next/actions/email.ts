'use server';

import nodemailer from 'nodemailer';

import { SMTP } from '@/lib/constants';

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    secure: true,
    host: SMTP.HOST as string,
    port: SMTP.PORT as number,
    auth: {
      user: SMTP.EMAIL as string,
      pass: SMTP.PASSWORD as string
    }
  });

  return await transporter.sendMail({
    to,
    html,
    subject,
    from: SMTP.EMAIL as string
  });
}
