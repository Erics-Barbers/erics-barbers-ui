import InstagramIcon from '@mui/icons-material/Instagram';
import { WhatsApp as WhatsappIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="grid w-full gap-8 border-t-2 border-white px-4 py-6 text-zinc-600 dark:text-zinc-400 sm:px-8 md:grid-cols-3 md:px-24">
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
        <div className="flex flex-col gap-2">
          <h5 className="text-base font-semibold mb-4">Socials</h5>
          <div className="flex items-center gap-2">
            <a
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/eric_barbers/"
            >
              <InstagramIcon />
            </a>
            <span className="text-sm">Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              href="https://wa.me/1234567890"
            >
              <WhatsappIcon />
            </a>
            <span className="text-sm">WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
