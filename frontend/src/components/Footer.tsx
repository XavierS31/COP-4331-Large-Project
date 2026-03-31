import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#d2c5ab]/15 bg-[#f4f4f2] dark:bg-[#1a1c1b] flex flex-col md:flex-row justify-between items-center px-12 py-10">
      <div className="mb-4 md:mb-0">
        <p className="font-body text-sm tracking-wide uppercase text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60">
          © {new Date().getFullYear()} University Research Portal. All rights reserved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide uppercase">
        <a className="text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60 hover:text-[#755b00] dark:hover:text-[#ffc909] underline decoration-[#ffc909] transition-opacity duration-150" href="#">About</a>
        <a className="text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60 hover:text-[#755b00] dark:hover:text-[#ffc909] underline decoration-[#ffc909] transition-opacity duration-150" href="#">Research Policy</a>
        <a className="text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60 hover:text-[#755b00] dark:hover:text-[#ffc909] underline decoration-[#ffc909] transition-opacity duration-150" href="#">Help</a>
        <a className="text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60 hover:text-[#755b00] dark:hover:text-[#ffc909] underline decoration-[#ffc909] transition-opacity duration-150" href="#">Privacy</a>
        <a className="text-[#1a1c1b]/60 dark:text-[#f9f9f7]/60 hover:text-[#755b00] dark:hover:text-[#ffc909] underline decoration-[#ffc909] transition-opacity duration-150" href="#">Ethics</a>
      </div>
    </footer>
  );
};
