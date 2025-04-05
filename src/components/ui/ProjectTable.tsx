import React from "react";
import { User } from "../../types";
import { WithId } from "../../types/firebase";

interface EmployeeTableProps {
  projects: WithId<User>[];
  onEdit: (employee: WithId<User>) => void;
  onRemove: (employeeId: string) => void;
}

const ProjectTable: React.FC<EmployeeTableProps> = ({
  projects,
  memberDetails,
  onEdit,
  onRemove,
}) => {
  return (
    <div className="overflow-hidden shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tech Skills
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Members
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project, index) => (
            <tr key={project.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {project?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {project?.name}
                    </div>
                    <div className="text-sm text-gray-500">{project.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 space-x-1">
                  {project.techStack.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#E7873C] rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 rounded-full">
                  {project.teamMembers.map((member) => {
                    const cleanedId = member.id.replace("/users/", "");
                    const name = memberDetails[cleanedId] || "Loading...";
                    return (
                      <span
                        key={member.id}
                        className="px-2 py-1 mr-2 bg-[#E7873C] text-xs font-bold rounded-full"
                      >
                        {name?.charAt(0)}
                      </span>
                    );
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
