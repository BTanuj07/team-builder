import api from './api';

export interface Skill {
  _id: string;
  name: string;
}

class SkillService {
  async getAllSkills(): Promise<{ success: boolean; skills: Skill[] }> {
    const response = await api.get('/skills');
    return response.data;
  }

  async createSkill(name: string) {
    const response = await api.post('/skills', { name });
    return response.data;
  }
}

export default new SkillService();
