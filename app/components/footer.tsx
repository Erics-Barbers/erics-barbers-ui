import InstagramIcon from '@mui/icons-material/Instagram';
import { WhatsApp as WhatsappIcon } from '@mui/icons-material';
import { Phone } from '@mui/icons-material';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full flex flex-row justify-around border-t-4 border-white pt-4 text-zinc-600 dark:text-zinc-400 pb-2">
      <div className="flex flex-col">
        <h5 className="text-base font-semibold mb-4">Developer</h5>
        <span className="text-sm">Website built by Fahmid Haque</span>
        <a
          className="text-sm underline text-blue-400 hover:text-blue-600"
          href="mailto:fahmidulhaque97@pm.me"
        >
          Contact: fahmidulhaque97@pm.me
        </a>
      </div>
      <div className="flex flex-col">
        <h5 className="text-base font-semibold mb-4">Legal</h5>
        <Link href="/privacy-policy">
          <span className="text-sm">Privacy Policy</span>
        </Link>
        <Link href="/terms-of-service">
          <span className="text-sm">Terms of Service</span>
        </Link>
      </div>
      <div className="flex flex-col">
        <div>
          <h5 className="text-base font-semibold mb-4">Socials</h5>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/eric_barbers/"
          >
            <InstagramIcon />
          </a>
          <span className="text-sm">Instagram</span>
        </div>
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://wa.me/1234567890"
          >
            <WhatsappIcon />
          </a>
          <span className="text-sm">WhatsApp</span>
        </div>
        <div>
          <a target="_blank" rel="noopener noreferrer" href="tel:1234567890">
            <Phone />
          </a>
          <span className="text-sm">Phone</span>
        </div>
      </div>
    </footer>
  );
}
