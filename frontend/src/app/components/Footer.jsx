import { sourceCodePro } from "../styles/fonts";

const Footer = () => {
  return (
    <footer
      className={`p-4 bg-gray-800 text-white w-full grid grid-cols-3 fixed bottom-0 ${sourceCodePro.className}`}
    >
      <p className={`text-center ${sourceCodePro.className}`}>
        <a
          href="https://x.com/shawn_builds/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors duration-300 hover:underline hover:underline-offset-2"
        >
          X/Twitter
        </a>
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        &copy; matchya.
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        <a
          href="https://www.figma.com/proto/zYc44w56sYTodeSDL3bn3F/matchya?page-id=31%3A81&node-id=43-1840&viewport=1248%2C228%2C0.12&t=vMD8voci0L7PRtCE-1&scaling=scale-down&content-scaling=fixed"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors duration-300 hover:underline hover:underline-offset-2"
        >
          Landing Page
        </a>
      </p>
    </footer>
  );
};

export default Footer;
