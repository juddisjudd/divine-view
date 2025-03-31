import {
  SITE_VERSION,
  MIT_LICENSE_URL,
  GITHUB_URL,
  KO_FI_URL,
} from "@/lib/constants";
import { Github, Coffee } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030303] border-t border-[#2a2a2a] py-3 px-4 sm:px-6 text-gray-500 shrink-0">
      {/* Desktop Footer */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:items-center w-full">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Divine View. Licensed under the{" "}
          <a
            href={MIT_LICENSE_URL}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            MIT License
          </a>
        </div>

        <div className="text-sm text-center">
          <span>Version: {SITE_VERSION}</span>
        </div>

        <div className="flex items-center space-x-4 justify-end">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-400 transition-colors"
          >
            <Github className="w-4 h-4 mr-1" />
            <span>GitHub</span>
          </a>

          <a
            href={KO_FI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-pink-500 hover:text-pink-400 transition-colors"
          >
            <Coffee className="w-4 h-4 mr-1" />
            <span>Support</span>
          </a>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="sm:hidden flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-[#1a1a1a] text-blue-500"
          >
            <Github className="w-5 h-5" />
          </a>

          <a
            href={KO_FI_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support me on Ko-fi"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-[#1a1a1a] text-pink-500"
          >
            <Coffee className="w-5 h-5" />
          </a>
        </div>

        <div className="text-center text-xs">Version: {SITE_VERSION}</div>

        <div className="text-center text-xs">
          &copy; {new Date().getFullYear()} Divine View.{" "}
          <a href={MIT_LICENSE_URL} className="text-zinc-400">
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
