import * as utils from '@/lib/utils';

type Props = {
  data: {
    date: string;
    time: string;
    duration: string;
    doctorName: string;
    patientName: string;
  };
};

export function ConfirmAppointment({ data }: Props) {
  return `<main>
      <p>🎉 Greetings,</p>
      <p>
        We are pleased to confirm your appointment scheduled for
        <strong>${utils.getDate(String(data.date), true, false)}</strong> at
        <strong>${utils.formatTime(data.time)}</strong>. The appointment is set
        for a duration of <strong>${data.duration}</strong> hour(s) with
        <strong>Dr. ${data.doctorName}</strong>
        and patient <strong>${data.patientName}</strong>. Please ensure you
        arrive at least 15 minutes prior to your scheduled time to allow for
        registration and preparation. We look forward to seeing you.
      </p>
      <p>Sincerely,</p>
      <p>
        <strong>Healthify</strong>
      </p>
    </main>`;
}

export function CancelAppointment({ data }: Props) {
  return `<main>
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>
        This is to confirm that your appointment scheduled for <strong>${utils.getDate(String(data.date), true, false)}</strong> at
        <strong>${utils.formatTime(data.time)}</strong>. The appointment is set for a duration of
        <strong>${data.duration}</strong> hour(s) with <strong>Dr. ${data.doctorName}</strong>
        has been cancelled successfully.
      </p>
      <p>Sincerely,</p>
      <p>
        <strong>Healthify</strong>
      </p>
    </main>`;
}
