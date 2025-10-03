'use client';

import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { ArrowDown, Printer } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize, formatTime, getDate } from '@/lib/utils';

export default function Page({
  appointment
}: {
  appointment: {
    id: string;
    date: Date;
    city: string;
    status: string;
    timeSlot: { time: string };
    patient: { name: string | null };
    doctor: {
      name: string | null;
      phone: string | null;
      UserSpecialities: { speciality: { name: string } }[];
    };
  };
}) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const receiptRef = useRef<HTMLDivElement>(null);
  const originalTheme = useRef<string | null>(null);

  useEffect(() => {
    setTheme('light');

    if (!originalTheme.current) {
      originalTheme.current = theme || 'system';
    }

    return () => {
      if (originalTheme.current) setTheme(originalTheme.current);
    };
  }, [pathname, setTheme, theme]);

  async function downloadPdf() {
    const element = receiptRef.current;
    if (!element) return;

    const dataUrl = await htmlToImage.toPng(element);

    const pdf = new jsPDF({
      format: 'a4',
      orientation: 'portrait',
      unit: 'px'
    });

    const y = 16;
    const size = 200;
    const format = 'PNG';
    const x = (pdf.internal.pageSize.getWidth() - size) / 2;

    pdf
      .addImage(dataUrl, format, x, y, size, size)
      .save(`appointment-${appointment.id}.pdf`);
  }

  return (
    <section className='bg-background text-foreground font-serif font-semibold print:bg-white print:text-black'>
      <header className='space-y-4 print:hidden'>
        <h1 className='mx-auto w-4/5 text-center text-xl capitalize'>
          Your appointment has been confirmed.
        </h1>
        <div className='mx-auto h-5 rounded-md border-5 shadow' />
      </header>
      <main className='overflow-hidden' ref={receiptRef}>
        <div className='print-animation -translate-y-[calc(100%+1rem)]'>
          <Card className='mx-auto mt-4 print:border print:border-dashed print:border-black print:shadow-none'>
            <CardContent className='grid min-h-50 grid-cols-2 gap-2 print:text-black'>
              <h2 className='col-span-2 text-center'>Queue 1</h2>
              <h2>Appointment Number</h2>
              <h2 className='text-right'>{appointment.id.slice(-5)}</h2>
              <h2>Doctor Speciality</h2>
              <h2 className='text-right'>
                {appointment.doctor.UserSpecialities.map(us =>
                  capitalize(us.speciality.name)
                ).toString()}
              </h2>
              <div>
                <span>Patient</span>
                <h3 className='font-sans'>{appointment.patient.name}</h3>
              </div>
              <div className='text-right'>
                <span>Doctor</span>
                <h3 className='font-sans'>{appointment.doctor.name}</h3>
              </div>
              <div>
                <span>Date</span>
                <h3 className='font-sans'>
                  {getDate(appointment.date.toString(), false, false)}
                </h3>
              </div>
              <div className='text-right'>
                <span>Time</span>
                <h3 className='font-sans'>
                  {formatTime(appointment.timeSlot.time)}
                </h3>
              </div>
              <div>
                <span>Location</span>
                <h3 className='font-sans'>{capitalize(appointment.city)}</h3>
              </div>
              <div className='text-right'>
                <span>Phone</span>
                <h3 className='font-sans'>{appointment.doctor.phone}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className='mx-auto h-24 content-center border-t border-dashed print:border-t print:border-dashed print:border-black print:shadow-none'>
            <CardContent className='mx-auto grid grid-cols-[3em_1fr] gap-2'>
              <svg
                className='rounded-md bg-black fill-white p-1 dark:bg-white dark:fill-black print:rounded-none print:fill-black print:p-1'
                viewBox='0 0 29.938 29.938'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M7.129 15.683h1.427v1.427h1.426v1.426H2.853V17.11h1.426v-2.853h2.853v1.426h-.003zm18.535 12.83h1.424v-1.426h-1.424v1.426zM8.555 15.683h1.426v-1.426H8.555v1.426zm19.957 12.83h1.427v-1.426h-1.427v1.426zm-17.104 1.425h2.85v-1.426h-2.85v1.426zm12.829 0v-1.426H22.81v1.426h1.427zm-5.702 0h1.426v-2.852h-1.426v2.852zM7.129 11.406v1.426h4.277v-1.426H7.129zm-1.424 1.425v-1.426H2.852v2.852h1.426v-1.426h1.427zm4.276-2.852H.002V.001h9.979v9.978zM8.555 1.427H1.426v7.127h7.129V1.427zm-5.703 25.66h4.276V22.81H2.852v4.277zm14.256-1.427v1.427h1.428V25.66h-1.428zM7.129 2.853H2.853v4.275h4.276V2.853zM29.938.001V9.98h-9.979V.001h9.979zm-1.426 1.426h-7.127v7.127h7.127V1.427zM0 19.957h9.98v9.979H0v-9.979zm1.427 8.556h7.129v-7.129H1.427v7.129zm0-17.107H0v7.129h1.427v-7.129zm18.532 7.127v1.424h1.426v-1.424h-1.426zm-4.277 5.703V22.81h-1.425v1.427h-2.85v2.853h2.85v1.426h1.425v-2.853h1.427v-1.426h-1.427v-.001zM11.408 5.704h2.85V4.276h-2.85v1.428zm11.403 11.405h2.854v1.426h1.425v-4.276h-1.425v-2.853h-1.428v4.277h-4.274v1.427h1.426v1.426h1.426V17.11h-.004zm1.426 4.275H22.81v-1.427h-1.426v2.853h-4.276v1.427h2.854v2.853h1.426v1.426h1.426v-2.853h5.701v-1.426h-4.276v-2.853h-.002zm0 0h1.428v-2.851h-1.428v2.851zm-11.405 0v-1.427h1.424v-1.424h1.425v-1.426h1.427v-2.853h4.276v-2.853h-1.426v1.426h-1.426V7.125h-1.426V4.272h1.426V0h-1.426v2.852H15.68V0h-4.276v2.852h1.426V1.426h1.424v2.85h1.426v4.277h1.426v1.426H15.68v2.852h-1.426V9.979H12.83V8.554h-1.426v2.852h1.426v1.426h-1.426v4.278h1.426v-2.853h1.424v2.853H12.83v1.426h-1.426v4.274h2.85v-1.426h-1.422zm15.68 1.426v-1.426h-2.85v1.426h2.85zM27.086 2.853h-4.275v4.275h4.275V2.853zM15.682 21.384h2.854v-1.427h-1.428v-1.424h-1.427v2.851zm2.853-2.851v-1.426h-1.428v1.426h1.428zm8.551-5.702h2.853v-1.426h-2.853v1.426zm1.426 11.405h1.427V22.81h-1.427v1.426zm0-8.553h1.427v-1.426h-1.427v1.426zm-12.83-7.129h-1.425V9.98h1.425V8.554z' />
              </svg>
              <div className='self-center print:text-black'>
                <h2>Note</h2>
                <p className='font-sans'>
                  Please bring ID and arrive 10 mins early
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className='print-cta grid grid-cols-2 gap-2 print:hidden'>
        <Button
          className='flex h-full cursor-pointer items-center gap-1 font-sans'
          onClick={() => print()}
          variant='outline'
        >
          <span>Print</span>
          <Printer className='h-1 w-1' />
        </Button>
        <Button
          className='flex h-full cursor-pointer items-center gap-1 font-sans'
          onClick={downloadPdf}
        >
          <span>Download</span>
          <ArrowDown className='h-1 w-1' />
        </Button>
      </footer>
    </section>
  );
}
