import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import useAuth from '../hooks/useAuth';
import useCollection from '../hooks/useCollection';
import { UserService } from '../services/users';
import { Project, Seat } from '../types';

const ProfilePage: React.FC = () => {
  const { userProfile, changePassword, changeEmail } = useAuth();
  const { showToast } = useUI();
  
  // States for form inputs
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(userProfile?.techSkills || []);
  
  // Get user's current projects and seat
  const { documents: userProjects } = useCollection<Project>(
    'projects',
    userProfile ? [{ field: 'teamMembers', operator: 'array-contains', value: userProfile.id }] : []
  );
  
  const { documents: userSeat } = useCollection<Seat>(
    'seats',
    userProfile ? [{ field: 'assignedTo', operator: '==', value: userProfile.id }] : []
  );
  
  // Common tech skills list
  const commonTechSkills = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 
    'Java', 'C#', '.NET', 'AWS', 'Azure', 'DevOps',
    'UI/UX', 'Product Management', 'Scrum Master'
  ];
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    try {
      const success = await changePassword(newPassword);
      if (success) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      showToast('Failed to update password', 'error');
    }
  };
  
  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await changeEmail(newEmail);
      if (success) {
        showToast('Email updated successfully', 'success');
        setNewEmail('');
      }
    } catch (error) {
      showToast('Failed to update email', 'error');
    }
  };
  
  // Handle tech skills update
  const handleSkillsUpdate = async () => {
    if (!userProfile) return;
    
    try {
      await UserService.updateUser(userProfile.id, {
        techSkills: selectedSkills
      });
      
      showToast('Skills updated successfully', 'success');
      setIsEditingSkills(false);
    } catch (error) {
      showToast('Failed to update skills', 'error');
    }
  };
  
  // Handle skill toggle
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  if (!userProfile) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <div className="flex items-center mb-6">
            <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
              {userProfile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-bold">{userProfile.displayName}</h3>
              <p className="text-gray-500">{userProfile.email}</p>
              <p className="mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {userProfile.role === 'admin' ? 'Administrator' :
                   userProfile.role === 'pm' ? 'Project Manager' :
                   userProfile.role === 'doe' ? 'Department Head' : 'Employee'}
                </span>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {userProfile.department}
                </span>
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Personal Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p>{userProfile.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p>{userProfile.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Seat</p>
                <p>
                  {userSeat && userSeat.length > 0 
                    ? `${userSeat[0].label}`
                    : 'No assigned seat'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p>{userProfile.manager ? 'Assigned' : 'None'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Security */}
        <div className="space-y-6">
          {/* Change Email */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-3">Change Email</h3>
            <form onSubmit={handleEmailChange}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#E7873C] text-white rounded"
                >
                  Update Email
                </button>
              </div>
            </form>
          </div>
          
          {/* Change Password */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-3">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#E7873C] text-white rounded"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Technical Skills */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Technical Skills</h3>
          {isEditingSkills ? (
            <div className="space-x-2">
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50"
                onClick={() => {
                  setIsEditingSkills(false);
                  setSelectedSkills(userProfile.techSkills || []);
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-[#E7873C] text-white rounded"
                onClick={handleSkillsUpdate}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50"
              onClick={() => setIsEditingSkills(true)}
            >
              Edit Skills
            </button>
          )}
        </div>
        
        {isEditingSkills ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {commonTechSkills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`skill-${index}`}
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="mr-2"
                />
                <label htmlFor={`skill-${index}`}>{skill}</label>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userProfile.techSkills && userProfile.techSkills.length > 0 ? (
              userProfile.techSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No technical skills added yet</p>
            )}
          </div>
        )}
      </div>
      
      {/* Current Projects */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4">Current Projects</h3>
        
        {userProjects.length > 0 ? (
          <div className="divide-y">
            {userProjects.map(project => (
              <div key={project.id} className="py-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Not assigned to any projects</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;