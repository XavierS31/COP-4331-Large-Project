import React from 'react';
import toast from 'react-hot-toast';

interface FacultySidebarProps {
  onCreateClick: () => void;
}

export const FacultySidebar: React.FC<FacultySidebarProps> = ({ onCreateClick }) => {
  return (
    <aside className="fixed left-0 top-0 w-64 bg-[#f4f4f2] dark:bg-[#1a1c1b] flex flex-col h-full py-8 px-4 gap-4 z-40">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-2">
          <img alt="University Crest" className="w-10 h-10 rounded-full bg-primary-container p-1"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwuVljnIE6qtkldplWb_i8A2j3LESDv8m5gqIv6wUdfsWlgQQYQ0hPbZmzmimbXaNYb77XDaSpGuZo8WEULv3zUXAYgKjRVEofi2K3DHlThrQuKiiOMS-KBuOYwfM95PQ5aqYlZw-rNWAW9g2zdqt6JQAouRf-T5Dbl8PueMtIe9G5Es44tnVn2Qu2cgq7uA_z6mCweftXxXGB47IkSrfjzG9H58cd7n_B4uF9Dm_6eOqiUn7E62lkAkj5u2J_AldDlnUZXmvl2b8" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-on-surface">Faculty Portal</span>
            <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface opacity-60">Research Administration</span>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        <a className="bg-surface-container-lowest text-primary font-bold rounded-l-lg flex items-center gap-3 px-4 py-3 font-body text-sm tracking-wide transition-all active:scale-95 cursor-pointer" onClick={(e) => { e.preventDefault(); toast('Feature coming soon!', { icon: '🚧' }); }}>
          <span className="material-symbols-outlined select-none">description</span>
          My Postings
        </a>
        <a className="text-on-surface opacity-60 flex items-center gap-3 px-4 py-3 font-body text-sm tracking-wide hover:bg-surface-variant transition-colors rounded-l-lg flex-1 cursor-pointer" onClick={(e) => { e.preventDefault(); toast('Feature coming soon!', { icon: '🚧' }); }}>
          <span className="material-symbols-outlined select-none">rate_review</span>
          Review Applications
        </a>
        <a className="text-on-surface opacity-60 flex items-center gap-3 px-4 py-3 font-body text-sm tracking-wide hover:bg-surface-variant transition-colors rounded-l-lg flex-1 cursor-pointer" onClick={(e) => { e.preventDefault(); toast('Feature coming soon!', { icon: '🚧' }); }}>
          <span className="material-symbols-outlined select-none">settings</span>
          Settings
        </a>
      </nav>
      <div className="mt-auto px-2">
        <button
          onClick={onCreateClick}
          className="w-full py-4 px-6 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-md shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          <span className="material-symbols-outlined text-sm select-none">add</span>
          Create New Posting
        </button>
      </div>
    </aside>
  );
};
