import React from 'react';

interface ApplicationCardProps {
  application: any;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  // Safety check: Ensure the application and posting data exist
  if (!application || !application.posting) return null;

  return (
    <article className="bg-surface-container-lowest p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Use .posting.title instead of .project.title */}
          <h3 className="font-headline text-lg font-bold text-on-surface">{application.posting.title}</h3>
          <p className="text-[10px] font-label text-secondary uppercase tracking-widest mt-1">
            Applied on: {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {application.status}
        </span>
      </div>

      {/* NEW: Section for the Project Description */}
      <div className="mb-4">
        <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-1">Project Description:</p>
        <p className="font-body text-sm text-on-surface line-clamp-2">
          {application.posting.description}
        </p>
      </div>
      
      <div className="bg-surface-variant/30 p-4 rounded-md">
        <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-2">My Statement:</p>
        {/* CHANGED: Use .message because that is what server.js returns */}
        <p className="font-body text-sm text-secondary italic">
          "{application.message || application.statement}"
        </p>
      </div>
    </article>
  );
};