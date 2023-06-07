// Importa las funciones necesarias de los SDK que necesitas
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Configuración de tu aplicación de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADERCOuWMW8N9HDtfjuEXyAJhDnTspqlA",
  authDomain: "autenticator-admin.firebaseapp.com",
  projectId: "autenticator-admin",
  storageBucket: "autenticator-admin.appspot.com",
  messagingSenderId: "590827558242",
  appId: "1:590827558242:web:af6da7fd03a1dd2c9b883b",
  measurementId: "G-EHZ24KGYD8"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Crea un usuario con email y contraseña
export const createUser = async (email, password) => {
  const auth = getAuth(app);
  return createUserWithEmailAndPassword(auth, email, password);
};

// Inicia sesión con email y contraseña
export const signInUser = async (email, password) => {
  const auth = getAuth(app);
  return signInWithEmailAndPassword(auth, email, password);
};

// Crea un documento en Firestore
export const createFirestoreDocument = async (userId, data) => {
  try {
    const firestore = getFirestore(app);
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, data);
    console.log("Documento de Firestore creado exitosamente!");
  } catch (error) {
    console.error("Error al crear el documento de Firestore:", error);
    throw error;
  }
};

// Exporta el objeto db
export const db = getFirestore(app);
