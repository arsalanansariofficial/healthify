import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

import { SOCIAL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className='sticky mx-auto mt-auto max-w-fit space-y-2 font-semibold'>
      <p className='text-muted-foreground space-x-1 text-center text-xs leading-5 capitalize'>
        <span>Created By</span>
        <Link
          className='text-muted-foreground hover:text-foreground'
          href={SOCIAL.WEBSITE as string}
        >
          Arsalan Ansari
        </Link>
      </p>
      <ul className='mx-auto flex max-w-fit gap-2'>
        <li>
          <a
            className='text-muted-foreground hover:text-foreground grid'
            href={SOCIAL.EMAIL as string}
            target='_blank'
            title='Email'
          >
            <FontAwesomeIcon icon={faEnvelope} size='sm' />
          </a>
        </li>
        <li>
          <a
            className='text-muted-foreground hover:text-foreground grid'
            href={SOCIAL.GITHUB as string}
            target='_blank'
            title='GitHub'
          >
            <FontAwesomeIcon icon={faGithub} size='sm' />
          </a>
        </li>
        <li>
          <a
            className='text-muted-foreground hover:text-foreground grid'
            href={SOCIAL.LINKEDIN as string}
            target='_blank'
            title='LinkedIn'
          >
            <FontAwesomeIcon icon={faLinkedin} size='sm' />
          </a>
        </li>
        <li>
          <a
            className='text-muted-foreground hover:text-foreground grid'
            href={SOCIAL.WHATSAPP as string}
            target='_blank'
            title='WhatsApp'
          >
            <FontAwesomeIcon icon={faWhatsapp} size='sm' />
          </a>
        </li>
      </ul>
    </footer>
  );
}
