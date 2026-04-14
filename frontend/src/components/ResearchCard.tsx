import React from 'react';

export interface ResearchPosting {
  _id: string;
  title: string;
  description: string;
  requiredMajor: string;
  department: string;
  facultyUsername: string;
  capacity?: number;
}

interface ResearchCardProps {
  posting: ResearchPosting;
  variant?: 'featured' | 'standard';
  onApply: (posting: ResearchPosting) => void; // 1. Added to interface
}

// 2. Added onApply to the destructuring here
export const ResearchCard: React.FC<ResearchCardProps> = ({ posting, variant = 'standard', onApply }) => {
  if (variant === 'featured') {
    return (
      <article className="xl:col-span-2 group bg-surface-container-lowest p-8 flex flex-col md:flex-row gap-8 transition-all hover:bg-surface-container-low hover:translate-x-1">
        <div className="w-full md:w-1/3 aspect-[4/5] bg-surface-container overflow-hidden">
          <img 
            alt="Research Lab"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUuKlVgbHtq-LCl6Cul2mHZluWyY7614bK_Zio6SkcUmFzNEoV6q7wW2JdhjdYKGZbWP-VHf6LSt7byfyuGL2mTPvfOqfFXoM6IoC3mpWWTQDQ_Zc3MbJQOkCKfUAmrnORKZcpirnOuKkm71Wj2eqDx1nPRPYpWmDPOq3gC2jzZ9azOST8YfO_td6gK1YyBGZTp6fyBAwB8HXuY47cCEBPV7qMU7F-aNExZh0FvBr2NbkP5CBgxaPCEGGlrH_HhtbogpI4j9MsHbQ" 
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Featured Project</span>
            <span className="material-symbols-outlined text-outline-variant text-sm select-none" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
          </div>
          <h3 className="font-headline text-3xl font-bold text-on-surface mb-4 leading-tight">{posting.title}</h3>
          <p className="font-body text-secondary text-sm mb-6 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis h-[63px]">{posting.description}</p>
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface uppercase font-bold text-[10px]">
                {posting.facultyUsername?.slice(0, 2)}
              </div>
              <span className="font-body text-sm font-semibold">Prof. {posting.facultyUsername}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">
                {posting.department}
              </span>
            </div>
            <div className="pt-6 flex items-center justify-between">
              <span className="font-label text-xs text-primary font-bold">MAJOR: {posting.requiredMajor?.toUpperCase()}</span>
              {/* Added onClick here */}
              <button 
                onClick={() => onApply(posting)}
                className="bg-primary-container text-on-primary-fixed px-6 py-2.5 rounded-md font-body font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard variant
  return (
    <article className="bg-surface-container-lowest p-6 flex flex-col transition-all hover:bg-surface-container-low hover:translate-x-1 min-h-[320px]">
      <div className="mb-4">
        <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">Open Position</span>
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{posting.title}</h3>
      <p className="font-body text-secondary text-xs mb-6 italic line-clamp-3 overflow-hidden text-ellipsis h-[54px]">{posting.description}</p>
      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-outline-variant select-none">person</span>
          <span className="font-body text-xs font-semibold">Prof. {posting.facultyUsername}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[9px] font-bold uppercase tracking-tighter">
            {posting.department}
          </span>
        </div>
        <div className="pt-4 border-t border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="font-label text-[10px] text-on-surface-variant font-bold truncate pr-2 max-w-[150px]">
              MAJOR: {posting.requiredMajor?.toUpperCase() || "ANY"}
            </span>
            <button className="italic font-headline text-primary text-sm hover:underline">View Details</button>
          </div>
          {/* Added onClick here */}
          <button 
            onClick={() => onApply(posting)}
            className="w-full mt-4 bg-primary-container text-on-primary-fixed py-2 rounded-md font-body font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
          >
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
};