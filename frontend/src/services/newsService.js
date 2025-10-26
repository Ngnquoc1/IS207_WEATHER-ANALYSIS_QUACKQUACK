import axios from '../lib/axios';

const newsService = {
  async searchNews(keyword, language = 'vi') {
    const response = await axios.get('/stories/search', {
      params: { keyword, language }
    });
    return response.data;
  },

  async getStories() {
    const response = await axios.get('/stories');
    return response.data;
  },

  async createStory(storyData) {
    const response = await axios.post('/stories', storyData);
    return response.data;
  },

  async deleteStory(id) {
    const response = await axios.delete(`/stories/${id}`);
    return response.data;
  }
};

export default newsService;

