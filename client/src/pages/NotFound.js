import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = styled((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    textAlign: 'center',
    minHeight: '70vh',
  },
  errorCode: {
    fontSize: '8rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  message: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(4),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

function NotFound() {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <div className={classes.root}>
      <Typography variant="h1" className={classes.errorCode}>
        404
      </Typography>
      <Typography variant="h5" className={classes.message}>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="textSecondary">
        A página que você está procurando não existe ou foi movida.
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
        >
          Voltar para o Dashboard
        </Button>
      </Box>
    </div>
  );
}

export default NotFound;