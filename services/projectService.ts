import api from './api';

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack?: string[]; // Array of technology names
  requiredSkills: any[];
  teamSize: number;
  timeline?: string;
  createdBy: any;
}

class ProjectService {
  async getAllProjects(filters?: { skills?: string; teamSize?: number; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.skills) params.append('skills', filters.skills);
    if (filters?.teamSize) params.append('teamSize', filters.teamSize.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  }

  async getProjectById(id: string) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  async getMyProjects() {
    const response = await api.get('/projects/my');
    return response.data;
  }

  async createProject(project: Omit<Project, 'id' | 'createdBy'>) {
    const response = await api.post('/projects', project);
    return response.data;
  }

  async updateProject(id: string, project: Partial<Project>) {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
}

export default new ProjectService();
