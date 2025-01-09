export const Footer: React.FC = () => {
  return (
    <footer className="flex items-center justify-center px-4 py-2 text-sm text-gray-500 border-t border-[#2a2a2a] bg-[#030303] shrink-0">
      &copy; {new Date().getFullYear()} Divine View. Licensed under the{" "}
      <a
        href="https://opensource.org/licenses/MIT"
        className="text-zinc-400 mx-1"
      >
        MIT License
      </a>
      . View the source code on{" "}
      <a
        href="https://github.com/juddisjudd/poe2-filter-editor"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 mx-1"
      >
        GitHub
      </a>
      . Support me on{" "}
      <a
        href="https://ko-fi.com/ohitsjudd"
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-500 mx-1"
      >
        Ko-fi
      </a>
      .
    </footer>
  );
};
