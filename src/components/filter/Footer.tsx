import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="px-4 py-2 text-sm text-gray-500 border-t border-[#2a2a2a] bg-[#1a1a1a] text-center">
      &copy; {new Date().getFullYear()} PoE2 Filter Editor. Licensed under the{" "}
      <a href="https://opensource.org/licenses/MIT">MIT License</a>. View the source code on{" "}
      <a href="https://github.com/your-repo-link" target="_blank" rel="noopener noreferrer">GitHub</a>.
    </footer>
  );
};
