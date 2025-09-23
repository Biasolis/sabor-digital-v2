import axios from 'axios';

const getSubdomain = () => {
  const host = window.location.hostname;
  
  // PARA DESENVOLVIMENTO: Use um subdomínio fixo em localhost.
  // Isso permite que o cardápio público carregue sem um subdomínio real.
  // Garanta que você possui um tenant com este subdomínio no seu banco de dados.
  if (host === 'localhost' || host.startsWith('127.0.0.1')) {
    return 'calabria'; // Exemplo: use o subdomínio de um tenant de teste
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

// Adiciona um interceptador para anexar o header do subdomínio em todas as requisições.
// O backend usará isso para rotas públicas. Para rotas protegidas,
// a prioridade será o tenant_id que já está no token JWT.
api.interceptors.request.use((config) => {
  const subdomain = getSubdomain();
  if (subdomain) {
    config.headers['X-Tenant-Subdomain'] = subdomain;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;