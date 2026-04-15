// import React, { useState } from 'react';

// // Using your specific domain name [cite: 13]
// const app_name = 'cop4331-11-domain.xyz';

// // Function that supports both local and remote development paths [cite: 11, 14-15]
// function buildPath(route: string): string {
//   // Check if the environment is in production mode [cite: 16-17]
//   if (import.meta.env.MODE != 'development') {
//     return 'http://' + app_name + ':5000/' + route; // Remote path [cite: 18-19]
//   } else {
//     return 'http://localhost:5000/' + route; // Local path [cite: 20-23]
//   }
// }

// function Login() {
//   const [message, setMessage] = useState('');
//   const [loginName, setLoginName] = useState('');
//   const [loginPassword, setPassword] = useState('');

//   async function doLogin(event: any): Promise<void> {
//     event.preventDefault();
//     const obj = { login: loginName, password: loginPassword };
//     const js = JSON.stringify(obj);

//     try {
//       // Changed the hardcoded fetch to use buildPath [cite: 25-26]
//       const response = await fetch(buildPath('api/login'), { 
//         method: 'POST', 
//         body: js, 
//         headers: { 'Content-Type': 'application/json' } 
//       });

//       const res = JSON.parse(await response.text());

//       if (res.id <= 0) {
//         setMessage('User/Password combination incorrect');
//       } else {
//         const user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
//         localStorage.setItem('user_data', JSON.stringify(user));
//         window.location.href = '/cards';
//       }
//     } catch (error: any) {
//       alert(error.toString());
//     }
//   }

//   return (
//     <div id="loginDiv">
//       <span id="inner-title">PLEASE LOG IN</span><br />
//       <input type="text" placeholder="Username" onChange={(e) => setLoginName(e.target.value)} /><br />
//       <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
//       <input type="submit" value="Login" onClick={doLogin} />
//       <span id="loginResult">{message}</span>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from 'react';

const app_name = 'cop4331-11-domain.xyz';

function buildPath(route: string): string {
  if (import.meta.env.MODE != 'development') {
    return 'http://' + app_name + ':5000/' + route;
  } else {
    return 'http://localhost:5000/' + route;
  }
}

function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), { 
        method: 'POST', 
        body: js, 
        headers: { 'Content-Type': 'application/json' } 
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else if (res.token) {
        const user = { firstName: res.user.firstName, lastName: res.user.lastName, id: res.user._id };
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('token', res.token);
        window.location.href = res.userType === 'student' ? '/dashboard/student' : '/dashboard/faculty';
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function doReset(event: any): Promise<void> {
    event.preventDefault();
    if (!loginName) {
      setMessage('Please enter your email/username in the field above to reset.');
      return;
    }
    try {
      const response = await fetch(buildPath('api/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginName })
      });
      const res = await response.json();
      setMessage(res.message || res.error);
    } catch (e: any) {
      setMessage("Error connecting to server.");
    }
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span><br />
      <input type="text" placeholder="Username/Email" onChange={(e) => setLoginName(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
      <input type="submit" value="Login" onClick={doLogin} />
      <input type="button" value="Forgot Password?" onClick={doReset} style={{marginLeft: '10px'}} />
      <br /><span id="loginResult">{message}</span>
    </div>
  );
}

export default Login;