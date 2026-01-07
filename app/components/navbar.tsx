import { Kaushan_Script } from 'next/font/google';
import InstagramIcon from '@mui/icons-material/Instagram';
import { WhatsApp as WhatsappIcon } from '@mui/icons-material';

const kaushan = Kaushan_Script({
  variable: '--font-kaushan',
  subsets: ['latin'],
  weight: ['400'],
});

export default function Navbar() {
  return (
    <nav className="w-full flex flex-row justify-between">
      <div className="flex flex-1 flex-row justify-between">
        <a href="/services">
          <span className={`text-2xl text-primary ${kaushan.className}`}>Services</span>
        </a>
        <a href="/information">
          <span className={`text-2xl text-primary ${kaushan.className}`}>Information</span>
        </a>
        <a href="/login">
          <span className={`text-2xl text-primary ${kaushan.className}`}>Account</span>
        </a>
      </div>
      <div className="flex flex-1 flex-row justify-center">
        <span
          className={`font-bold text-2xl text-primary ${kaushan.className}`}
        >
          <a href="/">Eric's Barbershop</a>
        </span>
      </div>

      <div className="flex flex-1 flex-row justify-end">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.instagram.com/eric_barbers/"
        >
          <InstagramIcon />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://wa.me/1234567890"
        >
          <WhatsappIcon />
        </a>
      </div>
    </nav>
  );
}
