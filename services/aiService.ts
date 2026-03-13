import api from './api';

export interface TeamRecommendation {
  userId: string;
  name: string;
  role: string;
  matchReason: string;
  skills: string[];
  email?: string;
  college?: string;
}

export interface AITeamResponse {
  success: boolean;
  data: {
    analysis: string;
    requiredSkills: string[];
    recommendedTeam: TeamRecommendation[];
    roleSplit: Record<string, string>;
    draftMessage: string;
    nextSteps: string[];
  };
  requiresApproval: boolean;
  message: string;
}

class AIService {
  async buildTeam(prompt: string): Promise<AITeamResponse> {
    const response = await api.post('/ai/build-team', { prompt });
    return response.data;
  }

  async matchSkills(requiredSkills: string[]) {
    const response = await api.post('/ai/match-skills', { requiredSkills });
    return response.data;
  }

  async findTeammates(roles: string[]) {
    const response = await api.post('/ai/find-teammates', { roles });
    return response.data;
  }

  async draftMessage(projectTitle: string, teamMembers: any[], context?: string) {
    const response = await api.post('/ai/draft-message', {
      projectTitle,
      teamMembers,
      context,
    });
    return response.data;
  }

  async getAILogs() {
    const response = await api.get('/ai/logs');
    return response.data;
  }
}

export default new AIService();
