import React from 'react';
import { Navigate } from 'react-router-dom';

const CustomerPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@SaborDigital:customer_token');
  
  // Se não houver token de cliente, redireciona para o login do cliente
  return token ? children : <Navigate to="/customer-login" />;
};

export default CustomerPrivateRoute;