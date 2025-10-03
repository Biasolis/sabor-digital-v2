import mercadopago from 'mercadopago';
const { MercadoPagoConfig } = mercadopago;

import 'dotenv/config';

// 1. Cria um cliente de configuração com seu Access Token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * Cria um plano de assinatura no Mercado Pago.
 * @param {string} name - Nome do plano (ex: "Plano Básico Mensal").
 * @param {number} amount - Valor da cobrança.
 * @param {'months' | 'years'} frequency_type - Frequência da cobrança.
 * @returns {Promise<string>} - O ID do plano criado no Mercado Pago.
 */
export const createSubscriptionPlan = async (name, amount, frequency_type) => {
  try {
    // CORREÇÃO: Acessa o serviço de planos diretamente do cliente
    const plan = new mercadopago.PreapprovalPlan(client);

    const planData = {
      body: {
        reason: name,
        auto_recurring: {
          frequency: 1,
          frequency_type: frequency_type,
          transaction_amount: amount,
          currency_id: 'BRL',
        },
        back_url: process.env.FRONTEND_URL || 'https://sabordigital.com',
        status: 'active',
      }
    };

    const response = await plan.create(planData);
    
    if (response.id) {
      return response.id;
    } else {
      throw new Error('Não foi possível obter o ID do plano do Mercado Pago.');
    }
  } catch (error) {
    console.error('Erro ao criar plano no Mercado Pago:', error.cause || error);
    throw new Error('Falha na comunicação com o gateway de pagamento ao criar plano.');
  }
};

/**
 * Cria um cliente no Mercado Pago (ou retorna um existente).
 * @param {string} email - Email do cliente.
 * @param {string} name - Nome do cliente.
 * @returns {Promise<string>} - O ID do cliente criado no Mercado Pago.
 */
export const createCustomer = async (email, name) => {
    try {
        // CORREÇÃO: Acessa o serviço de clientes diretamente do cliente
        const customer = new mercadopago.Customer(client);

        const existingCustomer = await customer.search({ options: { email } });
        if (existingCustomer.results && existingCustomer.results.length > 0) {
            return existingCustomer.results[0].id;
        }

        const customerData = { email, first_name: name };
        const newCustomer = await customer.create({ body: customerData });
        return newCustomer.id;
    } catch (error) {
        console.error('Erro ao criar cliente no Mercado Pago:', error.cause || error);
        throw new Error('Falha ao criar cliente no gateway de pagamento.');
    }
};

/**
 * Cria uma assinatura para um cliente com um cartão de crédito.
 * @param {string} planId - ID do plano no Mercado Pago.
 * @param {string} customerId - ID do cliente no Mercado Pago.
 * @param {string} cardToken - Token do cartão gerado no frontend.
 * @returns {Promise<object>} - O objeto da assinatura criada.
 */
export const createSubscription = async (planId, customerId, cardToken) => {
    try {
        // CORREÇÃO: Acessa os serviços diretamente do cliente
        const preapproval = new mercadopago.Preapproval(client);
        const customer = new mercadopago.Customer(client);

        const payer = await customer.findById({ customerId });
        if (!payer.email) {
            throw new Error('Cliente não encontrado ou sem e-mail no Mercado Pago.');
        }

        const subscriptionData = {
            body: {
                preapproval_plan_id: planId,
                card_token_id: cardToken,
                payer_email: payer.email,
            }
        };
        const response = await preapproval.create(subscriptionData);
        return response;
    } catch (error) {
        console.error('Erro ao criar assinatura no Mercado Pago:', error.cause || error);
        const errorMessage = error.cause?.error?.message || 'Falha ao criar assinatura no gateway de pagamento.';
        throw new Error(errorMessage);
    }
};