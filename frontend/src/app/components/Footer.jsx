import Link from "next/link";
import { aspekta } from "../styles/fonts";

const Footer = () => {
  return (
    <footer
      className={`absolute bottom-0 sm:p-4 px-1 py-2 gap-1 bg-white-dark text-mblack w-full flex flex-col-reverse sm:flex-row justify-between align-center text-xs ${aspekta.className}`}
    >
      <div className="flex gap-2 m-auto sm:m-0">
        <p className={`sm:text-left text-center ${aspekta.className}`}>
          &copy; matchya.
        </p>
        <Link href={`/privacy`} className="">
          Privacy Policy
        </Link>
        <Link href={`/tos`} className="">
          Terms of Service
        </Link>
      </div>
      <p className={`sm:text-right text-center ${aspekta.className}`}>
        Experiencing a software issue? &nbsp;
        <a
          href="#tally-open=nG0l1Z&tally-hide-title=1&tally-emoji-text=🍵&tally-emoji-animation=heart-beat"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange transition-colors duration-300 hover:underline hover:underline-offset-2"
        >
          Report a Bug
        </a>
      </p>
    </footer>
  );
};

export default Footer;
