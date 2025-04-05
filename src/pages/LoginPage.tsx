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
      // console.error('Login error:', err);
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
      // console.error('Demo login error:', err);
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
            className={`w-full py-2 bg-[#E7873C] text-white rounded ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
