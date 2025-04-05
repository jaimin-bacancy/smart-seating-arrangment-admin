// import React from 'react';
// import { AuthProvider } from './contexts/AuthContext';
// import { useAuth } from './contexts/AuthContext';
// import AppLayout from './components/layout/AppLayout';
// import { AuthService } from './services/auth';

// // This would be your login component in a real app
// const LoginPage = () => {

//   const [email, setEmail] = React.useState('admin@bacancy.com');
//   const [password, setPassword] = React.useState('admin@123');
//   const [error, setError] = React.useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       console.log('called')
//       await AuthService.loginUser(email, password);
//       // Firebase will update the auth state, so your context listener should trigger and redirect user
//     } catch (err: any) {
//       setError(err.message || 'Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Smart Office Admin</h1>
        
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input 
//               type="email" 
//               className="w-full p-2 border rounded" 
//               placeholder="your@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input 
//               type="password" 
//               className="w-full p-2 border rounded" 
//               placeholder="********"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <button 
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//           >
//             Sign In
//           </button>
//         </form>
        
//         <div className="mt-4 text-center">
//           <a href="#" className="text-sm text-blue-600 hover:underline">
//             Forgot password?
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main app with authentication flow
// const AuthenticatedApp = () => {
//   const { currentUser, loading } = useAuth();
//   console.log('loading:::', loading)
//   if (loading) {
//     // Loading spinner or message
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-2">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show login page if not authenticated
//   if (!currentUser) {
//     return <LoginPage />;
//   }
//   console.log('currentUser:::', currentUser)
//   // Show main app layout if authenticated
//   return <AppLayout />;
// };

// // Root App component that provides context
// const App: React.FC = () => {
//   return (
//     <AuthProvider>
//       <AuthenticatedApp />
//     </AuthProvider>
//   );
// };

// export default App;
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';

// Main app with authentication flow
const AuthenticatedApp = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    // Loading spinner or message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage />;
  }

  // Show main app layout if authenticated
  return <AppLayout />;
};

// Root App component that provides context
const App: React.FC = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </UIProvider>
  );
};

export default App;