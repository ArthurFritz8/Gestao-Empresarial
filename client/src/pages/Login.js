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

function Login() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" style={{ marginBottom: 20 }}>{error}</Alert>}
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Endereço de Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha"
        type="password"
        id="password"
        autoComplete="current-password"
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
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
      </Button>
      <Box className={classes.linkContainer}>
        <Typography variant="body2">
          Não tem uma conta? <RouterLink to="/register">Cadastre-se</RouterLink>
        </Typography>
      </Box>
    </form>
  );
}

export default Login;