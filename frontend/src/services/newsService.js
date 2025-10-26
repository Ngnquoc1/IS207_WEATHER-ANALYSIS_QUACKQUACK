import axios from '../lib/axios';

const newsService = {
  async searchNews(keyword, language = 'vi') {
    const response = await axios.get('/stories/search', {
      params: { keyword, language }
    });
    return response.data;
  },

  async getStories(page = 1, perPage = 10, filter = null) {
    const params = { page, per_page: perPage };
    if (filter) {
      params.filter = filter;
    }
    const response = await axios.get('/stories', { params });
    return response.data;
  },

  async getStoryStatistics() {
    const response = await axios.get('/stories/statistics');
    return response.data;
  },

  async createStory(storyData) {
    const response = await axios.post('/stories', storyData);
    return response.data;
  },

  async deleteStory(id) {
    const response = await axios.delete(`/stories/${id}`);
    return response.data;
  },

  async getHotStories(limit = 5) {
    const response = await axios.get('/stories/hot', {
      params: { limit }
    });
    return response.data;
  },

  async updateStoryStatus(id, statusData) {
    const response = await axios.put(`/stories/${id}/status`, statusData);
    return response.data;
  },

  async updateStory(id, updateData) {
    const response = await axios.put(`/stories/${id}`, updateData);
    return response.data;
  },

  async checkStoriesExist(urls) {
    const response = await axios.post('/stories/check', { urls });
    return response.data;
  }
};

export default newsService;

