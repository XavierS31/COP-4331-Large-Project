import React from 'react';

interface ApplicationCardProps {
  application: any;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  return (
    <article className="bg-surface-container-lowest p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{application.project.title}</h3>
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
      
      <div className="bg-surface-variant/30 p-4 rounded-md">
        <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-2">My Statement:</p>
        <p className="font-body text-sm text-secondary italic">"{application.statement}"</p>
      </div>
    </article>
  );
};