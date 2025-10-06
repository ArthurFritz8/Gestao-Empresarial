import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A', // Azul escuro - mais profissional para autopeças
      light: '#2C5282',
      dark: '#14274E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ED6C02', // Laranja - cor associada a peças automotivas
      light: '#FF8A65',
      dark: '#D84315',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7F9FC',
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
    error: {
      main: '#E53E3E',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3182CE',
    },
    success: {
      main: '#38A169',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    button: {
      textTransform: 'none', // Botões sem texto em maiúsculas
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#2C5282',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#FF8A65',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
        rounded: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: 10,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F7FAFC',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid #E2E8F0',
        },
        head: {
          fontWeight: 600,
          color: '#2D3748',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F7FAFC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;