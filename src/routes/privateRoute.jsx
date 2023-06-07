import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ roles, element: Element, ...props }) => {
  const isLoggedIn = true; // Cambia esta variable con tu lógica de autenticación
  const userRoles = ['user']; // Cambia esta variable con los roles del usuario autenticado

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.some(role => userRoles.includes(role))) {
    return <Navigate to="/access-denied" />;
  }

  return <Element {...props} />;
};

export default PrivateRoute;
