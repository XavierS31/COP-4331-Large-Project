import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FacultySidebar } from '../components/FacultySidebar';
import { CreatePostingModal } from '../components/CreatePostingModal';
import { PostingItem, type Posting } from '../components/PostingItem';
import { useAuth } from '../context/AuthContext';

// Step 1: Define your domain name [cite: 13, 67]
const app_name = 'cop4331-11-domain.xyz';

// Step 2: Implement the buildPath function with safe environment checking [cite: 14, 16]
function buildPath(route: string): string {
    const isDevelopment = typeof import.meta !== 'undefined' && 
                         import.meta.env && 
                         import.meta.env.MODE === 'development';

    if (!isDevelopment) {
        // Remote path for production [cite: 18]
        return 'http://' + app_name + ':5000/' + route;
    } else {
        // Local path for development [cite: 22]
        return 'http://localhost:5000/' + route;
    }
}

export const FacultyDashboard: React.FC = () => {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, token, refreshToken, logout } = useAuth();

  const fetchPostings = async () => {
    try {
      // Step 3: Update fetch to use buildPath instead of hardcoded localhost [cite: 26, 32]
      const response = await fetch(buildPath('api/postings/mine'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.token) {
        refreshToken(data.token);
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setPostings(data.postings || []);
    } catch (err) {
      toast.error('Failed to load your postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      <FacultySidebar onCreateClick={() => setCreateModalOpen(true)} />
      
      <main className="ml-64 w-full min-h-screen">
        <header className="fixed top-0 right-0 left-64 h-16 bg-[#f9f9f7]/80 dark:bg-[#1a1c1b]/80 backdrop-blur-md z-30 flex justify-between items-center px-8 border-none">
          <h1 className="font-headline font-black text-xl text-on-surface tracking-tight">Active Research Postings</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors select-none">notifications</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors select-none">help_outline</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant opacity-20"></div>
            <div className="flex items-center gap-3">
              <button onClick={logout} className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors mx-4">Sign Out</button>
              <div className="text-right group cursor-pointer">
                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant opacity-70">{user?.role || 'Faculty'}</p>
              </div>
              <img 
                alt="Faculty profile avatar" 
                className="w-10 h-10 rounded-full border-2 border-primary-container"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPRq9Te59csW_cgxEsF6Or8hW9Hrw_vCNf3YhQEFWeUTIlFw1xSQF1SXZkCnMajX8L0pstHqgyDv86laPbKv36f2XzUOUrmrLZcVzxwKS0vT0JahnBvnfzEUGy1ZoxZS3gBEQ591s8i4gLyGPIQMkgc8K5Oty08ZkrRjAhBF5VIqjE3AINaJdmrOPxdDyCuou8h2B3BOJ7Uhbkty0nN4hxR6VU1lPzSMmbCW7W5Pox9w4Ko8lxEFBeCCzXsPDWAOInPscWlrgk2N4" 
              />
            </div>
          </div>
        </header>
        
        <div className="pt-24 pb-12 px-12 max-w-6xl">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col justify-between h-48 group">
              <div className="relative z-10">
                <span className="text-xs font-label uppercase tracking-widest text-primary font-bold">Research Impact</span>
                <h2 className="text-3xl font-headline font-extrabold mt-2 tracking-tight">University of Scholarly Excellence</h2>
                <p className="text-on-surface-variant max-w-md mt-2 opacity-80 leading-relaxed">
                  Managing institutional foundations for quantum and biological research trajectories.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[12rem] select-none">auto_awesome</span>
              </div>
            </div>
            <div className="col-span-4 bg-primary-container/20 rounded-xl p-8 flex flex-col justify-between border-l-4 border-primary-container">
              <div>
                <span className="text-xs font-label uppercase tracking-widest text-primary font-bold">Total Active</span>
                <div className="text-5xl font-headline font-black mt-2">{postings.length < 10 ? `0${postings.length}` : postings.length}</div>
              </div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-sm select-none">trending_up</span>
                +12% from last term
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant animate-pulse">Loading postings...</div>
            ) : postings.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
                You have no active research postings.
              </div>
            ) : (
              postings.map(post => (
                <PostingItem 
                  key={post._id} 
                  posting={post} 
                  onDeleted={fetchPostings} 
                />
              ))
            )}
          </div>
        </div>
      </main>

      <CreatePostingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSuccess={fetchPostings}
      />
    </div>
  );
};