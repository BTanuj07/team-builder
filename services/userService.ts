import api from './api';

class UserService {
  async getAllUsers(filters?: { skills?: string; availability?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.skills) params.append('skills', filters.skills);
    if (filters?.availability) params.append('availability', filters.availability);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  }

  async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async updateProfile(userId: string, data: any) {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }

  async addSkill(userId: string, skillId: string) {
    const response = await api.post(`/users/${userId}/skills`, { skillId });
    return response.data;
  }

  async removeSkill(userId: string, skillId: string) {
    const response = await api.delete(`/users/${userId}/skills/${skillId}`);
    return response.data;
  }

  async matchUsers(requiredSkills: string[]) {
    const response = await api.post('/users/match', { requiredSkills });
    return response.data;
  }
}

export default new UserService();
