import {
  SITE_VERSION,
  MIT_LICENSE_URL,
  GITHUB_URL,
  KO_FI_URL,
} from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-[#2a2a2a] bg-[#030303] shrink-0">
      <div>
        &copy; {new Date().getFullYear()} Divine View. Licensed under the{" "}
        <a href={MIT_LICENSE_URL} className="text-zinc-400 mx-1">
          MIT License
        </a>
      </div>

      <div className="flex items-center space-x-4">
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span>Site Version: {SITE_VERSION}</span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 mx-1"
        >
          View source code on GitHub
        </a>
        <a
          href={KO_FI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 mx-1"
        >
          Support me on Ko-fi
        </a>
      </div>
    </footer>
  );
};
