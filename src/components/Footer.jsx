import { SiGithub, SiBuymeacoffee } from "react-icons/si";

export const Footer = () => {
  return (
    <footer>
      <a
        href="https://github.com/cletqui/app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiGithub />
      </a>

      <a
        href="https://www.buymeacoffee.com/cletqui"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiBuymeacoffee />
      </a>
    </footer>
  );
};
