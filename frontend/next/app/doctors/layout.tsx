import Link from 'next/link';

import * as CN from '@/components/ui/card';

type Props = Readonly<{ modal: React.ReactNode; children: React.ReactNode }>;

export default function Layout({ modal, children }: Props) {
  return (
    <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
      <aside className="sticky top-[7.35em] hidden max-h-[calc(100vh-10em)] min-w-[10em] lg:block">
        <CN.Card className="h-full overflow-y-auto">
          <CN.CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-semibold">
                Home
              </span>
              <ul>
                <li>
                  <Link href="/health-facilities" className="font-semibold">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-semibold">
                Application
              </span>
              <ul>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/record"
                  >
                    Record
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/membership"
                  >
                    Membership
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/details-of-subscription"
                  >
                    Details Of Subscription
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/health-guest-users"
                  >
                    Health Guest Users
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/doctors"
                  >
                    Doctors
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold"
                    href="/health-facilities/appointments"
                  >
                    Appointments
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-semibold">
                Reports
              </span>
              <ul>
                <li>
                  <Link href="/logs" className="font-semibold">
                    Logs
                  </Link>
                </li>
                <li>
                  <Link href="/email-logs" className="font-semibold">
                    Email Logs
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="font-semibold">
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-semibold">
                Settings
              </span>
              <ul>
                <li>
                  <Link href="/settings" className="font-semibold">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </CN.CardContent>
        </CN.Card>
      </aside>
      <div className="col-span-2 space-y-4 lg:col-start-2">
        {modal}
        {children}
      </div>
    </main>
  );
}
