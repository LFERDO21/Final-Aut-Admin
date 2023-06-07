import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from '../session';

const PrivateRoute = ({ element: Element, roles, ...rest }) => {
  const isAuthenticated = isLoggedIn();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Aquí puedes agregar la lógica para verificar los roles permitidos
  // Puedes utilizar la prop 'roles' para comparar con los roles del usuario autenticado

  return <Route {...rest} element={<Element />} />;
};

export default PrivateRoute;
