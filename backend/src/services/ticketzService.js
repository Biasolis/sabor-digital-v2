import axios from 'axios';
import 'dotenv/config';

const TICKETZ_API_URL = process.env.TICKETZ_API_URL;
const TICKETZ_API_TOKEN = process.env.TICKETZ_API_TOKEN;

/**
 * Envia uma mensagem de texto simples via API do Ticketz.
 * @param {string} number - O número de telefone do destinatário (ex: 5511999998888).
 * @param {string} body - O corpo da mensagem a ser enviada.
 * @returns {Promise<void>}
 */
export const sendMessage = async (number, body) => {
  // Se as variáveis de ambiente não estiverem configuradas, apenas exibe no console em modo de desenvolvimento.
  if (!TICKETZ_API_URL || !TICKETZ_API_TOKEN) {
    console.log('--- MENSAGEM SIMULADA PARA O TICKETZ ---');
    console.log(`> Para: ${number}`);
    console.log(`> Mensagem: ${body}`);
    console.log('-----------------------------------------');
    return;
  }

  try {
    await axios.post(
      `${TICKETZ_API_URL}/api/messages/send`,
      {
        number,
        body,
      },
      {
        headers: {
          Authorization: `Bearer ${TICKETZ_API_TOKEN}`,
        },
      }
    );
    console.log(`Mensagem enviada com sucesso para ${number} via Ticketz.`);
  } catch (error) {
    console.error('Erro ao enviar mensagem pelo Ticketz:', error.response?.data || error.message);
    // Em um sistema de produção, aqui poderíamos adicionar um sistema de retentativas ou logs mais robustos.
  }
};