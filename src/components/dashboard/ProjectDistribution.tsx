import React from 'react';
import { firestore } from '../../config/firebaseConfig';
import { Project } from '../../types';
import { WithId } from '../../types/firebase';
interface ProjectDistributionProps {
  projects: WithId<Project>[];
}

interface MemberDetails {
  [memberId: string]: string; // id -> displayName
}

const ProjectDistribution: React.FC<ProjectDistributionProps> = ({ projects }) => {
  const [memberDetails, setMemberDetails] = React.useState<MemberDetails>({});

  React.useEffect(() => {
    const fetchAllTeamMembers = async () => {
      const uniqueIds = new Set<string>();
  
      projects.forEach((project) => {
        project.teamMembers.forEach((member) => {
          const cleanedId = member.id.replace('/users/', '');
          if (!memberDetails[cleanedId]) {
            uniqueIds.add(cleanedId);
          }
        });
      });
  
      const promises = Array.from(uniqueIds).map(async (userId) => {
        const userRef = firestore.doc(`users/${userId}`);
        const userSnap = await userRef.get();
        return {
          id: userId,
          displayName: userSnap.exists ? userSnap.data().displayName : 'Unknown User',
        };
      });
  
      const results = await Promise.all(promises);
      const newDetails: MemberDetails = {};
      results.forEach(({ id, displayName }) => {
        newDetails[id] = displayName;
      });
  
      setMemberDetails((prev) => ({ ...prev, ...newDetails }));
    };
  
    fetchAllTeamMembers();
  }, [projects]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-6">Project Team Distribution</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-100 p-4 rounded shadow-md">
            <h4 className="font-semibold text-lg mb-2">{project.name}</h4>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Tech Stack:</span> {project.techStack.join(', ')}
            </p>
            <div>
              <p className="font-medium mb-1">Team Members:</p>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {project.teamMembers.map((member) => {
                  const cleanedId = member.id.replace('/users/', '');
                  const name = memberDetails[cleanedId] || 'Loading...';
                  return <li key={member.id}>{name}</li>;
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDistribution;
