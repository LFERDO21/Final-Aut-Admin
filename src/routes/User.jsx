import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Modal, Card, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { startSession, endSession, getSession, isLoggedIn, getSessionToken } from '../session';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { TextField, MenuItem } from '@mui/material';

const UserPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [psychologist, setPsychologist] = useState('');
  const [adminName, setAdminName] = useState('');
  const [questionErrors, setQuestionErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [tests, setTests] = useState([]);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }

    let session = getSession();
    setEmail(session.email);

    // Obtener datos del psicólogo desde la base de datos y establecer el nombre en el estado
    const getPsychologistData = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', session.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        setPsychologist(userData.name);
      });
    };

    getPsychologistData();

    // Obtener el nombre del administrador desde la colección "users"
    const getAdminNameFromCollection = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', session.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        setAdminName(userData.name);
      });
    };

    getAdminNameFromCollection();

    // Obtener los tests creados por el usuario
    const getTests = async () => {
      const testsRef = collection(db, 'tests');
      const q = query(testsRef, where('psychologist', '==', psychologist));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTests(tests);
    };

    getTests();

    console.log('Your access token is: ' + session.accessToken);
  }, [navigate, psychologist]);

  const handleAddQuestion = () => {
    setQuestions((prevQuestions) => [...prevQuestions, { text: '', type: '' }]);
    setQuestionErrors((prevErrors) => [...prevErrors, false]);
  };

  const handleQuestionChange = (index, event) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = event.target.value;
    setQuestions(updatedQuestions);
    setQuestionErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors[index] = false;
      return updatedErrors;
    });
  };

  const handleTypeChange = (index, event) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = event.target.value;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(index, 1);
      return updatedQuestions;
    });
    setQuestionErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors.splice(index, 1);
      return updatedErrors;
    });
  };

  const handleSubmit = async () => {
    if (!testName || questions.length === 0 || questionErrors.some((error) => error === true)) {
      alert('Por favor, complete todos los campos antes de guardar las preguntas.');
      return;
    }

    const currentDateTime = new Date().toISOString();
    const sessionToken = getSessionToken();

    if (editingTestId) {
      // Modificar el test existente
      const testRef = doc(db, 'tests', editingTestId);
      await updateDoc(testRef, {
        testName,
        questions,
        psychologist,
        updatedAt: currentDateTime,
        sessionToken: sessionToken,
      });
    } else {
      // Agregar un nuevo test
      await addDoc(collection(db, 'tests'), {
        testName,
        questions,
        psychologist,
        createdAt: currentDateTime,
        sessionToken: sessionToken,
      });
    }

    console.log('Preguntas guardadas en la base de datos.');

    setTestName('');
    setQuestions([]);
    setQuestionErrors([]);
    setShowModal(true);
    setEditingTestId(null);

    // Actualizar la lista de tests
    const testsRef = collection(db, 'tests');
    const q = query(testsRef, where('psychologist', '==', psychologist));
    const querySnapshot = await getDocs(q);
    const updatedTests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTests(updatedTests);
  };

  const handleEditTest = async (testId) => {
    // Obtener los detalles del test a editar
    const testRef = doc(db, 'tests', testId);
    const testSnapshot = await getDocs(testRef);
    if (!testSnapshot.empty) {
      const test = testSnapshot.docs[0].data();
      setTestName(test.testName);
      setQuestions(test.questions);
      setEditingTestId(testId);
    }
  };

  const handleDeleteTest = (testId) => {
    setTestToDelete(testId);
    setDeleteConfirmationDialogOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    try {
      // Eliminar el test de la base de datos
      const testRef = doc(db, 'tests', testToDelete);
      await deleteDoc(testRef);

      // Cerrar el diálogo de confirmación de eliminación
      setDeleteConfirmationDialogOpen(false);
      setTestToDelete(null);

      // Actualizar la lista de tests
      const testsRef = collection(db, 'tests');
      const q = query(testsRef, where('psychologist', '==', psychologist));
      const querySnapshot = await getDocs(q);
      const updatedTests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTests(updatedTests);
    } catch (error) {
      console.error('Error al eliminar el test:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = () => {
    endSession();
    navigate('/login');
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h6" component="h1" textAlign="center" gutterBottom>
        Bienvenido: {psychologist}
      </Typography>
      <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
        {email}
      </Typography>
      <Typography variant="p" component="p" textAlign="center" gutterBottom>
        Revisar (access/session) token.
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Agregar nueva prueba
      </Typography>
      <TextField
        label="Nombre de la prueba"
        variant="outlined"
        fullWidth
        margin="normal"
        value={testName}
        onChange={(event) => setTestName(event.target.value)}
      />
      <Typography variant="h6" component="h2" gutterBottom>
        Preguntas:
      </Typography>
      {questions.map((question, index) => (
        <div key={index}>
          <TextField
            label={`Pregunta ${index + 1}`}
            variant="outlined"
            fullWidth
            margin="normal"
            value={question.text}
            onChange={(event) => handleQuestionChange(index, event)}
          />
          <TextField
            select
            label="Tipo de pregunta"
            value={question.type}
            onChange={(event) => handleTypeChange(index, event)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Visual">Visual</MenuItem>
            <MenuItem value="Auditivo">Auditivo</MenuItem>
            <MenuItem value="Kinestésico">Kinestésico</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => handleDeleteQuestion(index)}>
            Borrar pregunta
          </Button>
        </div>
      ))}
      <Button variant="contained" onClick={handleAddQuestion}>
        Agregar pregunta
      </Button>
      <Button variant="contained" onClick={handleSubmit}>
        {editingTestId ? 'Guardar cambios' : 'Guardar preguntas'}
      </Button>
      <Button variant="contained" onClick={handleLogout}>
        Cerrar sesión
      </Button>

      <Modal open={showModal} onClose={handleCloseModal}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              Prueba guardada
            </Typography>
            <Typography variant="body2" component="p">
              La prueba se ha guardado correctamente en la base de datos.
            </Typography>
            <Button variant="contained" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </Modal>

      <Dialog
        open={deleteConfirmationDialogOpen}
        onClose={() => setDeleteConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este test? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" component="h1" gutterBottom>
        Tus tests
      </Typography>
      <List>
        {tests.map((test) => (
          <ListItem key={test.id}>
            <ListItemText primary={test.testName} secondary={`Creado el ${test.createdAt}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditTest(test.id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTest(test.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default UserPage;