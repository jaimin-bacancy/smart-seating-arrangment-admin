import { firestore } from '../config/firebaseConfig';
import { Project, ProjectStatus } from '../types';
import { FirestoreService } from './firebase';
import { WithId } from '../types/firebase';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
const COLLECTION = 'projects';

// Service for managing projects
export const ProjectService = {
  // Create a new project
  createProject: async (
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    projectManagerId: string,
    priority: number = 3,
    techStack: string[] = [],
    status: ProjectStatus = 'planning'
  ): Promise<string> => {
    try {
      const pmRef = firestore.collection('users').doc(projectManagerId);
      
      const projectData: Omit<Project, 'id'> = {
        name,
        description,
        startDate: firestore.Timestamp.fromDate(startDate),
        endDate: firestore.Timestamp.fromDate(endDate),
        projectManager: pmRef,
        priority,
        techStack,
        status,
        teamMembers: [pmRef] // PM is also a team member
      };
      
      return FirestoreService.createDocument<Omit<Project, 'id'>>(
        COLLECTION,
        projectData
      );
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  // Get a project by ID
  getProjectById: async (id: string): Promise<WithId<Project> | null> => {
    return FirestoreService.getDocument<Project>(COLLECTION, id);
  },
  
  // Update a project
  updateProject: async (id: string, data: Partial<Project>): Promise<void> => {
    return FirestoreService.updateDocument<Project>(COLLECTION, id, data);
  },
  
  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    return FirestoreService.deleteDocument(COLLECTION, id);
  },
  
  // Get all projects
  getAllProjects: async (): Promise<WithId<Project>[]> => {
    return FirestoreService.getCollection<Project>(COLLECTION);
  },
  
  // Get projects by status
  getProjectsByStatus: async (status: ProjectStatus): Promise<WithId<Project>[]> => {
    return FirestoreService.queryCollection<Project>(
      COLLECTION,
      'status',
      '==',
      status
    );
  },
  
  // Get projects by priority
  getProjectsByPriority: async (priority: number): Promise<WithId<Project>[]> => {
    return FirestoreService.queryCollection<Project>(
      COLLECTION,
      'priority',
      '==',
      priority
    );
  },
  
  // Get projects for a user
  getProjectsForUser: async (userId: string): Promise<WithId<Project>[]> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const snapshot = await firestore
        .collection(COLLECTION)
        .where('teamMembers', 'array-contains', userRef)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithId<Project>[];
    } catch (error) {
      console.error(`Error getting projects for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Add a team member to a project
  addTeamMember: async (projectId: string, userId: string): Promise<void> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const projectRef = firestore.collection(COLLECTION).doc(projectId);
      
      // Add user to project's team members
      await projectRef.update({
        teamMembers: arrayUnion(userRef)
      });
      
      // Add project to user's current projects
      await userRef.update({
        currentProjects: arrayUnion(projectRef)
      });
    } catch (error) {
      console.error(`Error adding user ${userId} to project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Remove a team member from a project
  removeTeamMember: async (projectId: string, userId: string): Promise<void> => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const projectRef = firestore.collection(COLLECTION).doc(projectId);
      
      // Remove user from project's team members
      await projectRef.update({
        teamMembers: arrayRemove(userRef)
      });
      
      // Remove project from user's current projects
      await userRef.update({
        currentProjects: arrayRemove(projectRef)
      });
    } catch (error) {
      console.error(`Error removing user ${userId} from project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Update project status
  updateProjectStatus: async (projectId: string, status: ProjectStatus): Promise<void> => {
    try {
      await firestore.collection(COLLECTION).doc(projectId).update({
        status
      });
    } catch (error) {
      console.error(`Error updating status for project ${projectId}:`, error);
      throw error;
    }
  }
};

export default ProjectService;
