import React from "react";
import { Alert, Box, Button, Container, Link, TextField, Typography, Autocomplete } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser, createFirestoreDocument } from "../firebase";
import { startSession } from "../session";

export default function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [career, setCareer] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const careers = [
    "Tecnologias de la informacion",
    "Gastronomia",
    "Turismo",
    "Logistica"
  ];

  const onSubmit = async (event) => {
    event.preventDefault();

    // validate the inputs
    if (!email || !password || !repeatPassword) {
      setError("Please fill out all the fields.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    // clear the errors
    setError("");

    try {
      // Create the user in Firebase Authentication
      let registerResponse = await createUser(email, password);

      // Create a document in Firestore for the user
      await createFirestoreDocument(registerResponse.user.uid, {
        name,
        gender,
        dateOfBirth,
        career,
        email,
        userType: "alumno" // Additional field for user type
      });

      // Start the user session
      startSession(registerResponse.user);

      // Navigate to the user page
      navigate("/user");
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1 }}
          fullWidth
        />
        <TextField
          label="Date of Birth"
          variant="outlined"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          sx={{ mt: 3 }}
          fullWidth
        />
        <Autocomplete
          id="gender-select"
          sx={{ width: 300, mt: 3 }}
          options={["", "Male", "Female", "Other"]}
          renderInput={(params) => (
            <TextField {...params} label="Gender" variant="outlined" />
          )}
          value={gender}
          onChange={(e, newValue) => setGender(newValue)}
        />
        <Autocomplete
          id="career-select"
          sx={{ width: 300, mt: 3 }}
          options={careers}
          renderInput={(params) => (
            <TextField {...params} label="Career" variant="outlined" />
          )}
          value={career}
          onChange={(e, newValue) => setCareer(newValue)}
        />
        <TextField
          label="Email"
          variant="outlined"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 3 }}
          fullWidth
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mt: 3 }}
          fullWidth
        />
        <TextField
          label="Repeat password"
          variant="outlined"
          type="password"
          autoComplete="repeat-new-password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          sx={{ mt: 3 }}
          fullWidth
        />
        <Button variant="contained" type="submit" sx={{ mt: 3 }} fullWidth>
          Register
        </Button>
        <Box sx={{ mt: 2 }}>
          Already have an account? <Link href="/login">Login</Link>
        </Box>
      </Box>
    </Container>
  );
}
