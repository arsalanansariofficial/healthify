import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope';

import { CONTACT } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="sticky mx-auto mt-auto max-w-fit space-y-2">
      <p className="text-muted-foreground space-x-1 text-center text-xs leading-5 capitalize">
        <span>Created By</span>
        <strong>Arsalan Ansari</strong>
      </p>
      <ul className="mx-auto flex max-w-fit gap-2">
        <li className="h-4 w-4">
          <a
            title="Email"
            target="_blank"
            href={CONTACT.email}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
        </li>
        <li className="h-4 w-4">
          <a
            title="GitHub"
            target="_blank"
            href={CONTACT.gitHub}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </li>
        <li className="h-4 w-4">
          <a
            title="LinkedIn"
            target="_blank"
            href={CONTACT.linkedIn}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        </li>
        <li className="h-4 w-4">
          <a
            target="_blank"
            title="WhatsApp"
            href={CONTACT.whatApp}
            className="text-muted-foreground hover:text-foreground grid"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </li>
      </ul>
    </footer>
  );
}
