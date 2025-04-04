import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';

import * as CONST from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="sticky mx-auto mt-auto max-w-fit space-y-2 font-semibold">
      <p className="text-muted-foreground space-x-1 text-center text-xs leading-5 capitalize">
        <span>Created By</span>
        <Link
          href={CONST.WEBSITE}
          className="text-muted-foreground hover:text-foreground"
        >
          Arsalan Ansari
        </Link>
      </p>
      <ul className="mx-auto flex max-w-fit gap-2">
        <li>
          <a
            title="Email"
            target="_blank"
            href={CONST.MAIL_TO}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon size="sm" icon={faEnvelope} />
          </a>
        </li>
        <li>
          <a
            title="GitHub"
            target="_blank"
            href={CONST.GIT_HUB}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon size="sm" icon={faGithub} />
          </a>
        </li>
        <li>
          <a
            title="LinkedIn"
            target="_blank"
            href={CONST.LINKED_IN}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon size="sm" icon={faLinkedin} />
          </a>
        </li>
        <li>
          <a
            target="_blank"
            title="WhatsApp"
            href={CONST.WHATS_APP}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon size="sm" icon={faWhatsapp} />
          </a>
        </li>
      </ul>
    </footer>
  );
}
