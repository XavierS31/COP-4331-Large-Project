// import React from 'react';

// interface ApplicationCardProps {
//   application: any;
// }

// export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
//   // Safety check: Ensure the application and posting data exist
//   if (!application || !application.posting) return null;

//   return (
//     <article className="bg-surface-container-lowest p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-all">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           {/* Use .posting.title instead of .project.title */}
//           <h3 className="font-headline text-lg font-bold text-on-surface">{application.posting.title}</h3>
//           <p className="text-[10px] font-label text-secondary uppercase tracking-widest mt-1">
//             Applied on: {new Date(application.appliedAt).toLocaleDateString()}
//           </p>
//         </div>
//         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
//           application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
//         }`}>
//           {application.status}
//         </span>
//       </div>

//       {/* NEW: Section for the Project Description */}
//       <div className="mb-4">
//         <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-1">Project Description:</p>
//         <p className="font-body text-sm text-on-surface line-clamp-2">
//           {application.posting.description}
//         </p>
//       </div>
      
//       <div className="bg-surface-variant/30 p-4 rounded-md">
//         <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-2">My Statement:</p>
//         {/* CHANGED: Use .message because that is what server.js returns */}
//         <p className="font-body text-sm text-secondary italic">
//           "{application.message || application.statement}"
//         </p>
//       </div>
//     </article>
//   );
// };

// ApplicationCard.tsx
import React from 'react';

interface ApplicationCardProps {
  application: any;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  if (!application || !application.posting) return null;

  // Helper to get status-specific styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          bg: 'bg-green-100 text-green-800',
          icon: 'check_circle',
          iconColor: 'text-green-600'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100 text-red-800',
          icon: 'cancel',
          iconColor: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-yellow-100 text-yellow-800',
          icon: 'pending',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <article className="bg-surface-container-lowest p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{application.posting.title}</h3>
          <p className="text-[10px] font-label text-secondary uppercase tracking-widest mt-1">
            Applied on: {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
        
        {/* NEW: Enhanced Status Badge with Icon */}
        <div className="flex flex-col items-end gap-1">
          <span className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${statusConfig.bg}`}>
            <span className="material-symbols-outlined text-[14px]">{statusConfig.icon}</span>
            {application.status}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-1">Project Description:</p>
        <p className="font-body text-sm text-on-surface line-clamp-2">
          {application.posting.description}
        </p>
      </div>
      
      <div className="bg-surface-variant/30 p-4 rounded-md">
        <p className="font-label text-[10px] uppercase text-on-surface-variant font-bold mb-2">My Statement:</p>
        <p className="font-body text-sm text-secondary italic">
          "{application.message || application.statement}"
        </p>
      </div>

      {/* NEW: Next Steps Note (Optional - if provided by Faculty) */}
      {application.nextSteps && application.status === 'accepted' && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
          <p className="text-[10px] font-bold uppercase text-primary mb-1">Faculty Note:</p>
          <p className="text-sm text-on-surface">{application.nextSteps}</p>
        </div>
      )}
    </article>
  );
};