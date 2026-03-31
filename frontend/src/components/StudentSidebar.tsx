import React from 'react';

interface StudentSidebarProps {
  onFilterChange: (filter: string, value: string) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ onFilterChange }) => {
  return (
    <aside className="h-screen w-64 pt-8 bg-[#f4f4f2] dark:bg-[#1a1c1b] fixed left-0 top-16 flex flex-col gap-4 p-6 overflow-y-auto z-40 border-r border-outline-variant/20">
      <div className="mb-6">
        <h2 className="font-headline text-lg font-bold text-on-surface border-l-4 border-primary pl-2">Filters</h2>
        <p className="font-body text-xs text-secondary mt-1 ml-3">Refine your inquiry</p>
      </div>
      <div className="space-y-4">
        
        <div className="group relative">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded bg-primary/10 text-primary font-bold border-r-4 border-primary transition-transform duration-200">
            <span className="material-symbols-outlined select-none">school</span>
            <span className="font-label text-sm tracking-wide">Department</span>
          </div>
          <select 
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physics">Physics</option>
            <option value="Neuroscience">Neuroscience</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        <div className="group relative">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-variant/50 transition-transform duration-200">
            <span className="material-symbols-outlined select-none">psychology</span>
            <span className="font-label text-sm tracking-wide">Major</span>
          </div>
          <select 
            onChange={(e) => onFilterChange('major', e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="">All Majors</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Cognitive Science">Cognitive Science</option>
            <option value="Sociology">Sociology</option>
          </select>
        </div>

      </div>
      <div className="mt-auto pb-20">
        <button 
          onClick={() => {
            onFilterChange('department', '');
            onFilterChange('major', '');
            // In a real app we'd need to controlled-reset the selects
          }}
          className="w-full text-left font-label text-xs uppercase tracking-widest text-primary font-bold hover:underline transition-all">
          Clear All Filters
        </button>
      </div>
    </aside>
  );
};
