import React from "react";
import ProjectTable from "../components/ui/ProjectTable";
import { firestore } from "../config/firebaseConfig";
import useCollection from "../hooks/useCollection";
import { Project } from "../types";

interface MemberDetails {
  [memberId: string]: string; // id -> displayName
}

const ProjectsPage: React.FC = () => {
  const [memberDetails, setMemberDetails] = React.useState<MemberDetails>({});

  const { documents: projects } = useCollection<Project>("projects", [
    { field: "status", operator: "==", value: "active" },
  ]);

  React.useEffect(() => {
    const fetchAllTeamMembers = async () => {
      const uniqueIds = new Set<string>();

      projects.forEach((project) => {
        project.teamMembers.forEach((member) => {
          const cleanedId = member.id.replace("/users/", "");
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
          displayName: userSnap.exists
            ? userSnap.data().displayName
            : "Unknown User",
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
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ProjectTable projects={projects} memberDetails={memberDetails} />
      </div>
    </div>
  );
};

export default ProjectsPage;
