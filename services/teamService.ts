import api from './api';

class TeamService {
  async getAllTeams() {
    const response = await api.get('/teams');
    return response.data;
  }

  async getTeam(id: string) {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  }

  async createTeam(name: string, projectId?: string) {
    const response = await api.post('/teams', { name, project: projectId });
    return response.data;
  }

  async addMember(teamId: string, userId: string) {
    const response = await api.post(`/teams/${teamId}/members`, { userId });
    return response.data;
  }

  async removeMember(teamId: string, userId: string) {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  }

  async joinByQR(teamId: string) {
    const response = await api.post('/teams/join-qr', { teamId });
    return response.data;
  }
}

export default new TeamService();
