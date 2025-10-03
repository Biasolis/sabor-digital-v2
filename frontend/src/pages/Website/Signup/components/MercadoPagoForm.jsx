import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';

// Lembre-se de adicionar sua Chave Pública no arquivo .env.local ou .env
const MERCADO_PAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

const MercadoPagoForm = ({ onCardTokenReady }) => {
  useEffect(() => {
    if (!MERCADO_PAGO_PUBLIC_KEY) {
      console.error("Chave pública do Mercado Pago não foi encontrada.");
      toast.error("A configuração de pagamento está ausente. Contate o suporte.");
      return;
    }

    const mp = new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY);
    const cardForm = mp.cardForm({
      amount: "1.00", // Valor simbólico, o valor real será definido no backend
      iframe: true,
      form: {
        id: 'form-checkout',
        cardNumber: { id: 'form-checkout__cardNumber' },
        cardExpirationMonth: { id: 'form-checkout__cardExpirationMonth' },
        cardExpirationYear: { id: 'form-checkout__cardExpirationYear' },
        cardholderName: { id: 'form-checkout__cardholderName' },
        securityCode: { id: 'form-checkout__securityCode' },
        installments: { id: 'form-checkout__installments' },
        identificationType: { id: 'form-checkout__identificationType' },
        identificationNumber: { id: 'form-checkout__identificationNumber' },
        issuer: { id: 'form-checkout__issuer' },
      },
      callbacks: {
        onFormMounted: error => {
          if (error) return console.warn('Form Mounted handling error: ', error);
        },
        onCardTokenReceived: (error, token) => {
          if (error) {
            console.error('Erro ao receber token do cartão:', error);
            toast.error('Verifique os dados do cartão inserido.');
            return;
          }
          onCardTokenReady(token.id);
        },
      },
    });

    // Limpeza ao desmontar o componente
    return () => {
      cardForm.unmount();
    };
  }, [onCardTokenReady]);

  return (
    <Box id="form-container">
      <Typography variant="h6" gutterBottom>Dados do Cartão</Typography>
      <form id="form-checkout">
        <div id="form-checkout__cardNumber" className="container"></div>
        <div id="form-checkout__cardExpirationMonth" className="container"></div>
        <div id="form-checkout__cardExpirationYear" className="container"></div>
        <div id="form-checkout__cardholderName" className="container"></div>
        <div id="form-checkout__securityCode" className="container"></div>
        <select id="form-checkout__issuer" name="issuer" style={{display: 'none'}}></select>
        <select id="form-checkout__installments" name="installments" style={{display: 'none'}}></select>
        <select id="form-checkout__identificationType" name="identificationType" style={{display: 'none'}}></select>
        <input type="text" id="form-checkout__identificationNumber" name="identificationNumber" style={{display: 'none'}}/>
      </form>
      <style>{`
        .container {
          height: 48px;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 1rem;
        }
      `}</style>
    </Box>
  );
};

export default MercadoPagoForm;