import React, { useState, useEffect } from 'react';
import OptimizationParams from '../components/algorithm/OptimizationParams';
import ScheduleOptions from '../components/algorithm/ScheduleOptions';
import ManualControls from '../components/algorithm/ManualControls';
import useSeatingAlgorithm from '../hooks/useSeatingAlgorithm';
import useCollection from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';
import { User, Project, Seat, AlgorithmParameters } from '../types';

const AlgorithmPage: React.FC = () => {
  // Default optimization parameters
  const defaultParams: AlgorithmParameters = {
    teamProximityWeight: 75,
    techStackWeight: 60,
    crossTeamWeight: 40,
    deadlineWeight: 85
  };

  // State for algorithm parameters and scheduling
  const [params, setParams] = useState<AlgorithmParameters>(defaultParams);
  const [autoRun, setAutoRun] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<string>('weekly');
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
  const [isSuccessMessage, setIsSuccessMessage] = useState<boolean>(false);

  // Get the current user
  const { userProfile } = useAuth();

  // Fetch data needed for the algorithm
  const { documents: employees } = useCollection<User>('users');
  const { documents: projects } = useCollection<Project>('projects');
  const { documents: seats } = useCollection<Seat>('seats');

  // Get the seating optimization algorithm hook
  const { optimizeSeating, loading, error } = useSeatingAlgorithm();

  // Show error message if algorithm fails
  useEffect(() => {
    if (error) {
      setOptimizationResult(`Optimization failed: ${error.message}`);
      setIsSuccessMessage(false);
    }
  }, [error]);

  // Reset parameters to default
  const handleResetParams = () => {
    setParams(defaultParams);
  };

  // Run the optimization algorithm
  const handleRunOptimization = async () => {
    if (!userProfile) return;

    try {
      setOptimizationResult(null);

      // Create a plan name with timestamp
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const planName = `Seating Plan - ${timestamp}`;
      const planDescription = `Generated with team proximity: ${params.teamProximityWeight}%, tech stack: ${params.techStackWeight}%, cross-team: ${params.crossTeamWeight}%, deadline: ${params.deadlineWeight}%`;

      // Run the algorithm
      const planId = await optimizeSeating(
        employees,
        projects,
        seats,
        params,
        planName,
        planDescription,
        userProfile.id
      );

      // Show success message
      setOptimizationResult(`Seating plan successfully generated! Plan ID: ${planId}`);
      setIsSuccessMessage(true);
    } catch (e) {
      console.error('Failed to run optimization:', e);
      setOptimizationResult(`Failed to generate seating plan: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsSuccessMessage(false);
    }
  };

  // Save the current configuration
  const handleSaveConfig = () => {
    // In a real app, this would save the configuration to Firestore
    const configName = prompt('Enter a name for this configuration:');
    if (configName) {
      // Save configuration logic would go here
      setOptimizationResult(`Configuration "${configName}" saved successfully`);
      setIsSuccessMessage(true);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">AI Algorithm Configuration</h2>
      
      {/* Show result message if any */}
      {optimizationResult && (
        <div className={`p-4 mb-6 rounded ${isSuccessMessage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {optimizationResult}
        </div>
      )}
      
      {/* Optimization Parameters */}
      <OptimizationParams params={params} onChange={setParams} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Scheduling Options */}
        <ScheduleOptions 
          autoRun={autoRun}
          frequency={frequency}
          onAutoRunChange={setAutoRun}
          onFrequencyChange={setFrequency}
        />
        
        {/* Manual Controls */}
        <ManualControls 
          onRunOptimization={handleRunOptimization}
          onResetParams={handleResetParams}
          onSaveConfig={handleSaveConfig}
          isRunning={loading}
        />
      </div>
    </div>
  );
};

export default AlgorithmPage;