import axios from 'axios';

const getSubdomain = () => {
  const host = window.location.hostname;
  
  // PARA DESENVOLVIMENTO: Use um subdomínio fixo em localhost.
  // Isso permite que o cardápio público carregue sem um subdomínio real.
  // Garanta que você possui um tenant com este subdomínio no seu banco de dados.
  if (host === 'localhost' || host.startsWith('127.0.0.1')) {
    return 'calabria'; // Mantenha um subdomínio padrão para o menu público
  }
  
  const parts = host.split('.');
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0];
  }
  return null;
};

const api = axios.create({
  baseURL: 'http://localhost:3333/api', // A porta do nosso backend
});

// Interceptador de API APRIMORADO
api.interceptors.request.use((config) => {
  // Se a URL da requisição for para o superadmin, não fazemos nada.
  if (config.url.includes('/superadmin')) {
    return config;
  }

  // Para todas as outras requisições, continuamos adicionando o subdomínio.
  const subdomain = getSubdomain();
  if (subdomain) {
    config.headers['X-Tenant-Subdomain'] = subdomain;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;