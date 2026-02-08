// import React, { useState, useEffect } from 'react';
// import './AccessGuard.css';

// interface AccessGuardProps {
//     children: React.ReactNode;
// }

// const ACCESS_KEY = 'maktab_access_granted';
// const ACCESS_DURATION_DAYS = 1;

// const AccessGuard: React.FC<AccessGuardProps> = ({ children }) => {
//     const [isVerified, setIsVerified] = useState<boolean | null>(null);
//     const [code, setCode] = useState('');
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     // Check if access is already granted
//     useEffect(() => {
//         const checkAccess = () => {
//             const accessData = localStorage.getItem(ACCESS_KEY);
//             if (accessData) {
//                 try {
//                     const { expiry } = JSON.parse(accessData);
//                     if (new Date().getTime() < expiry) {
//                         setIsVerified(true);
//                         return;
//                     }
//                     // Access expired
//                     localStorage.removeItem(ACCESS_KEY);
//                 } catch {
//                     localStorage.removeItem(ACCESS_KEY);
//                 }
//             }
//             setIsVerified(false);
//         };

//         checkAccess();
//     }, []);

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');

//         // Small delay for UX
//         setTimeout(() => {
//             const accessCode = import.meta.env.VITE_ACCESS_CODE || 'MAKTAB-2026';
//             const trimmedCode = code.trim().toUpperCase();

//             if (trimmedCode === accessCode.toUpperCase()) {
//                 // Grant access for 1 day
//                 const expiry = new Date().getTime() + (ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000);
//                 localStorage.setItem(ACCESS_KEY, JSON.stringify({ expiry }));
//                 setIsVerified(true);
//             } else {
//                 setError('Invalid access code. Please try again.');
//                 setCode('');
//             }
//             setIsLoading(false);
//         }, 500);
//     };

//     // Still checking access
//     if (isVerified === null) {
//         return (
//             <div className="access-guard-loading">
//                 <div className="access-spinner"></div>
//             </div>
//         );
//     }

//     // Access verified
//     if (isVerified) {
//         return <>{children}</>;
//     }

//     // Show access code prompt
//     return (
//         <div className="access-guard">
//             <div className="access-card">
//                 <div className="access-header">
//                     <div className="access-icon">🔐</div>
//                     <h1>Private Access</h1>
//                     <p>This application is currently in development. Please enter your access code to continue.</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="access-form">
//                     <div className="input-group">
//                         <input
//                             type="text"
//                             value={code}
//                             onChange={(e) => setCode(e.target.value)}
//                             placeholder="Enter access code"
//                             className={error ? 'error' : ''}
//                             autoFocus
//                             disabled={isLoading}
//                         />
//                     </div>

//                     {error && <p className="error-message">{error}</p>}

//                     <button type="submit" disabled={isLoading || !code.trim()}>
//                         {isLoading ? 'Verifying...' : 'Access App'}
//                     </button>
//                 </form>

//                 <p className="access-footer">
//                     Contact the developer for access credentials
//                 </p>
//             </div>
//         </div>
//     );
// };

// // export default AccessGuard;
