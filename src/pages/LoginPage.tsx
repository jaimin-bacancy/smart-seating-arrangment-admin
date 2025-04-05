import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { useUI } from '../contexts/UIContext';

const LoginPage: React.FC = () => {
  const { showToast } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await AuthService.loginUser(email, password);
      
      // Login successful - the auth observer in AuthContext will redirect
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle guest login (for demo purposes)
  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a demo admin user if it doesn't exist
      try {
        await AuthService.registerUser(
          'admin@example.com',
          'Admin123!',
          {
            displayName: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            department: 'Administration',
            employeeId: 'ADMIN-001',
            techSkills: ['Administration'],
            currentProjects: []
          }
        );
      } catch (error) {
        // User might already exist, which is fine
        console.log('Demo user may already exist', error);
      }
      
      // Log in as the demo admin
      await AuthService.loginUser('admin@example.com', 'Admin123!');
      
      // Login successful - the auth observer in AuthContext will redirect
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to log in with demo account');
      showToast('Demo login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Smart Office Admin</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            className={`w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Demo Account
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
