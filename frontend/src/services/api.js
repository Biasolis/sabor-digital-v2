import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api', // A porta do nosso backend
});

export default api;