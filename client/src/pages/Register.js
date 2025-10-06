import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const useStyles = styled((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
  },
  linkContainer: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  }
}));

function Register() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await register({ name, email, password });
    
    setLoading(false);

    if (result) {
      setSuccess('Usuário registrado com sucesso! Você será redirecionado para o login.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError('Erro ao registrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" style={{ marginBottom: 20 }}>{error}</Alert>}
      {success && <Alert severity="success" style={{ marginBottom: 20 }}>{success}</Alert>}

      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="name"
        label="Nome Completo"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Endereço de Email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha (mínimo 6 caracteres)"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
      </Button>
      <Box className={classes.linkContainer}>
        <Typography variant="body2">
          Já tem uma conta? <RouterLink to="/login">Faça login</RouterLink>
        </Typography>
      </Box>
    </form>
  );
}

export default Register;