// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import PageTitle from './PageTitle';

// // Step 1: Define your application name/domain 
// const app_name = 'cop4331-11-domain.xyz';

// // Step 2: Add the buildPath function to handle environment switching [cite: 14-15]
// function buildPath(route: string): string {
//   if (import.meta.env.MODE !== 'development') {
//     // Remote path for production [cite: 16-19]
//     return 'http://' + app_name + ':5000/' + route;
//   } else {
//     // Local path for development [cite: 20-23]
//     return 'http://localhost:5000/' + route;
//   }
// }

// export const LoginForm: React.FC = () => {
//   const [loginId, setLoginId] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'student' | 'faculty'>('student');
  
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   useEffect(() => {
//     if (searchParams.get('verified') === 'true') {
//       toast.success('Email verified! You can now log in.');
//     }
//   }, [searchParams]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!loginId || !password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     try {
//       // Step 3: Update fetch to use buildPath instead of hardcoded localhost [cite: 25-27]
//       const response = await fetch(buildPath('api/login'), {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ login: loginId, password })
//       });
//       const data = await response.json();

//       if (data.error) {
//         toast.error(data.error);
//         return;
//       }
      
//       if (data.token) {
//         login({ user: data.user, userType: data.userType, token: data.token });
//         if (data.userType === 'student') {
//           navigate('/dashboard/student');
//         } else {
//           navigate('/dashboard/faculty');
//         }
//       } else {
//         toast.error('Invalid credentials');
//       }
//     } catch (err) {
//       toast.error('Connection error. Please try again.');
//     }
//   };

//   return (
//     <section className="w-full md:w-1/2 bg-surface flex items-center justify-center p-8 md:p-24">
//       <div className="w-full max-w-md">
//         <div className="mb-8 flex justify-center md:justify-start">
//           <PageTitle />
//         </div>
//         <div className="mb-12">
//           <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">Institutional Login</h2>
//           <p className="text-on-surface-variant font-body">Enter your credentials to access your research dashboard.</p>
//         </div>
        
//         <div className="bg-surface-container-low p-1.5 rounded-full flex mb-10 w-full">
//           <button 
//             type="button"
//             onClick={() => setRole('student')}
//             className={`flex-1 py-3 px-6 rounded-full font-headline font-bold text-sm transition-all ${role === 'student' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
//             Student
//           </button>
//           <button 
//             type="button"
//             onClick={() => setRole('faculty')}
//             className={`flex-1 py-3 px-6 rounded-full font-headline font-bold text-sm transition-all ${role === 'faculty' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
//             Faculty
//           </button>
//         </div>

//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-1">
//             <label htmlFor="loginId" className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">University Email / Username</label>
//             <div className="relative group">
//               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40">alternate_email</span>
//               <input
//                 id="loginId"
//                 value={loginId}
//                 onChange={e => setLoginId(e.target.value)}
//                 className="w-full bg-surface-container-low border-none rounded-sm py-4 pl-12 pr-4 focus:ring-0 focus:ring-offset-0 border-b-2 border-transparent focus:border-primary-container transition-all placeholder:text-on-surface-variant/30"
//                 placeholder="username" 
//                 type="text" 
//               />
//             </div>
//           </div>
//           <div className="space-y-1">
//             <div className="flex justify-between items-end">
//               <label htmlFor="password" className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Security Password</label>
//               <a className="text-primary text-xs font-bold hover:underline decoration-[#ffc909]" href="#">Forgot Password?</a>
//             </div>
//             <div className="relative">
//               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40">lock_open</span>
//               <input
//                 id="password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 className="w-full bg-surface-container-low border-none rounded-sm py-4 pl-12 pr-10 focus:ring-0 focus:ring-offset-0 border-b-2 border-transparent focus:border-primary-container transition-all placeholder:text-on-surface-variant/30"
//                 placeholder="••••••••" 
//                 type="password" 
//               />
//             </div>
//           </div>
//           <div className="flex items-center gap-2 py-2">
//             <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container" id="remember" type="checkbox" />
//             <label className="text-sm text-on-surface-variant font-body select-none" htmlFor="remember">Remember this device</label>
//           </div>
//           <button className="w-full gold-gradient-btn text-white font-headline font-black py-5 rounded-lg shadow-xl shadow-primary/10 hover:scale-[0.98] transition-transform duration-150 mt-4 uppercase tracking-wider" type="submit">
//             Authenticate Identity
//           </button>
//         </form>
//         <div className="mt-12 pt-8 border-t border-outline-variant/15 text-center">
        
//         </div>
//       </div>
//     </section>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageTitle from './PageTitle';

const app_name = 'cop4331-11-domain.xyz';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route;
  } else {
    return 'http://localhost:5000/' + route;
  }
}

export const LoginForm: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now log in.');
    }
  }, [searchParams]);

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) {
      toast.error('Please enter your email or username');
      return;
    }

    try {
      const response = await fetch(buildPath('api/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetIdentifier })
      });
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('If that account exists, a reset link has been sent.');
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password })
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      if (data.token) {
        login({ user: data.user, userType: data.userType, token: data.token });
        navigate(data.userType === 'student' ? '/dashboard/student' : '/dashboard/faculty');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    }
  };

  return (
    <section className="w-full md:w-1/2 bg-surface flex items-center justify-center p-8 md:p-24 relative">
      
      {/* FORGOT PASSWORD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md p-8 rounded-2xl shadow-2xl border border-outline-variant/20">
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">Reset Password</h3>
            <p className="text-on-surface-variant mb-6">Enter your username or email address and we'll send you a recovery link.</p>
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <input
                type="text"
                placeholder="Email or Username"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg py-4 px-4 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-high transition-all">Cancel</button>
                <button type="submit" className="flex-1 gold-gradient-btn text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider">Send Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center md:justify-start"><PageTitle /></div>
        <div className="mb-12">
          <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">Institutional Login</h2>
          <p className="text-on-surface-variant font-body">Access your research dashboard.</p>
        </div>
        
        <div className="bg-surface-container-low p-1.5 rounded-full flex mb-10 w-full">
          <button type="button" onClick={() => setRole('student')} className={`flex-1 py-3 px-6 rounded-full font-headline font-bold text-sm transition-all ${role === 'student' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>Student</button>
          <button type="button" onClick={() => setRole('faculty')} className={`flex-1 py-3 px-6 rounded-full font-headline font-bold text-sm transition-all ${role === 'faculty' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>Faculty</button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">University Email / Username</label>
            <input
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-sm py-4 px-4 focus:ring-0 focus:border-primary-container transition-all"
              placeholder="username" 
              type="text" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Security Password</label>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="text-primary text-xs font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-sm py-4 px-4 focus:ring-0 focus:border-primary-container transition-all"
              placeholder="••••••••" 
              type="password" 
            />
          </div>
          <button className="w-full gold-gradient-btn text-white font-headline font-black py-5 rounded-lg shadow-xl uppercase tracking-wider" type="submit">
            Authenticate Identity
          </button>
        </form>
      </div>
    </section>
  );
};