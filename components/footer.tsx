import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope';

import { CONTACT } from '@/lib/constants';
import { Card, CardContent } from './ui/card';

export default function Footer() {
  return (
    <footer className="mx-8">
      <Card className="py-2">
        <CardContent className="space-y-2 sm:flex sm:items-center sm:justify-between">
          <ul className="mx-auto flex max-w-fit gap-2 sm:mx-0 sm:max-w-none">
            <li className="h-4 w-4">
              <a
                title="Email"
                target="_blank"
                href={CONTACT.email}
                className="text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faEnvelope} size="sm" />
              </a>
            </li>
            <li className="h-4 w-4">
              <a
                title="GitHub"
                target="_blank"
                href={CONTACT.gitHub}
                className="text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faGithub} size="sm" />
              </a>
            </li>
            <li className="h-4 w-4">
              <a
                title="LinkedIn"
                target="_blank"
                href={CONTACT.linkedIn}
                className="text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faLinkedin} size="sm" />
              </a>
            </li>
            <li className="h-4 w-4">
              <a
                target="_blank"
                title="WhatsApp"
                href={CONTACT.whatApp}
                className="text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faWhatsapp} size="sm" />
              </a>
            </li>
          </ul>
          <p className="text-muted-foreground text-center text-xs leading-5">
            Created by <u className="underline-offset-2">Arsalan Ansari</u>.
          </p>
        </CardContent>
      </Card>
    </footer>
  );
}
