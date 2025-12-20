'use server';

import nodemailer from 'nodemailer';

import { SMTP } from '@/lib/constants';

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    auth: {
      pass: SMTP.PASSWORD as string,
      user: SMTP.EMAIL as string
    },
    host: SMTP.HOST as string,
    port: SMTP.PORT as number,
    secure: true
  });

  return await transporter.sendMail({
    from: SMTP.EMAIL as string,
    html,
    subject,
    to
  });
}
