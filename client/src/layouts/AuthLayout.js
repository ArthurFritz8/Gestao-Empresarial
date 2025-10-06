import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container, Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const useStyles = styled((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    padding: theme.spacing(2),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 450,
  },
  logo: {
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
    color: theme.palette.primary.main,
    fontWeight: 500,
  }
}));

function AuthLayout() {
  const classes = useStyles();
  const { isAuthenticated } = useAuth();

  // Redireciona para o dashboard se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={classes.paper}>
          <Typography variant="h4" component="h1" className={classes.title}>
            SGEP
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Sistema de Gestão de Vendas e Estoque
          </Typography>
          <Box mt={2} width="100%">
            <Outlet />
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default AuthLayout;