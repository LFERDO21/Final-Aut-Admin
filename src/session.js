export const startSession = (users) => {
  sessionStorage.setItem("email", users.email);
  sessionStorage.setItem("accessToken", users.accessToken);
  sessionStorage.setItem("name", users.name); // Agregar el nombre del psicólogo al sessionStorage
  sessionStorage.setItem("psychologistToken", users.psychologistToken); // Agregar el token del psicólogo al sessionStorage
};

export const getSession = () => {
  return {
    email: sessionStorage.getItem("email"),
    accessToken: sessionStorage.getItem("accessToken"),
    name: sessionStorage.getItem("name"), // Obtener el nombre del psicólogo desde el sessionStorage
    psychologistToken: sessionStorage.getItem("psychologistToken"), // Obtener el token del psicólogo desde el sessionStorage
  };
};

export const endSession = () => {
  sessionStorage.clear();
};

export const isLoggedIn = () => {
  return getSession().accessToken;
};

export const getSessionToken = () => {
  return getSession().psychologistToken;
};
