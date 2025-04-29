import { FaGithub, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md py-2 shadow-inner border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="text-black dark:text-white text-sm font-medium text-center md:text-left">
          © 2025 SynapShare. Made by Kamlesh
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
          >
            <FaGithub size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
