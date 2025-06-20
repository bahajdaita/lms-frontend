import { createTheme } from '@mui/material/styles';

// Khan Academy inspired color palette
const colors = {
  primary: {
    main: '#00a60e',      // Khan's signature green
    light: '#4caf50',
    dark: '#00701a',
  },
  secondary: {
    main: '#1865f2',      // Progress blue
    light: '#42a5f5',
    dark: '#1565c0',
  },
  background: {
    default: '#f7f8fa',   // Light background
    paper: '#ffffff',     // Card background
  },
  text: {
    primary: '#21242c',   // Dark text
    secondary: '#5f6368', // Gray text
  },
  success: {
    main: '#00a60e',      // Completed green
  },
  warning: {
    main: '#ff8c00',      // In-progress orange
  },
  info: {
    main: '#1865f2',      // Info blue
  },
  error: {
    main: '#d32f2f',      // Error red
  }
};

const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.text.primary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: colors.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Khan Academy's rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Pill-shaped buttons
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 166, 14, 0.2)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        colorPrimary: {
          backgroundColor: colors.primary.main,
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: colors.secondary.main,
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: colors.text.primary,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: `${colors.primary.main}15`,
          },
          '&.Mui-selected': {
            backgroundColor: `${colors.primary.main}25`,
            color: colors.primary.main,
            '&:hover': {
              backgroundColor: `${colors.primary.main}30`,
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
        },
        bar: {
          borderRadius: 4,
          background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        },
      },
    },
  },
});

export default theme;