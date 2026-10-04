import { createTheme, ThemeOptions } from '@mui/material/styles';

// KALAM Official Design System Tokens
export const KALAM_TOKENS = {
  inkBlack: '#171717',
  warmIvory: '#FAF7F0',
  saffron: '#E59B2F',
  saffronHover: '#D48A1E',
  terracotta: '#C96B4B',
  warmSand: '#E8DFD2',
  surfaceWhite: '#FFFFFF',
  mutedText: '#7A7067',
  darkBg: '#141210',
  darkPaper: '#1E1B18',
  darkBorder: '#2E2823',
  darkMutedText: '#B8AEA3',
};

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#FAF7F0' : KALAM_TOKENS.inkBlack,
        light: isDark ? '#FFFFFF' : '#333333',
        dark: isDark ? '#E8DFD2' : '#000000',
        contrastText: isDark ? KALAM_TOKENS.inkBlack : '#FFFFFF',
      },
      secondary: {
        main: KALAM_TOKENS.saffron,
        light: '#F3B458',
        dark: KALAM_TOKENS.saffronHover,
        contrastText: '#FFFFFF',
      },
      info: {
        main: KALAM_TOKENS.terracotta,
        light: '#DA8466',
        dark: '#B35537',
      },
      success: {
        main: isDark ? '#4ADE80' : '#16A34A',
        light: '#86EFAC',
        dark: '#15803D',
      },
      warning: {
        main: isDark ? '#FBBF24' : '#D97706',
        light: '#FDE68A',
        dark: '#B45309',
      },
      error: {
        main: isDark ? '#F87171' : '#DC2626',
        light: '#FCA5A5',
        dark: '#991B1B',
      },
      background: {
        default: isDark ? KALAM_TOKENS.darkBg : KALAM_TOKENS.warmIvory,
        paper: isDark ? KALAM_TOKENS.darkPaper : KALAM_TOKENS.surfaceWhite,
      },
      text: {
        primary: isDark ? '#FAF7F0' : KALAM_TOKENS.inkBlack,
        secondary: isDark ? KALAM_TOKENS.darkMutedText : KALAM_TOKENS.mutedText,
      },
      divider: isDark ? KALAM_TOKENS.darkBorder : KALAM_TOKENS.warmSand,
    },
    typography: {
      fontFamily: ['"Plus Jakarta Sans"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(','),
      h1: {
        fontFamily: ['"Newsreader"', '"Plus Jakarta Sans"', 'Georgia', 'serif'].join(','),
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.025em',
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: ['"Newsreader"', '"Plus Jakarta Sans"', 'Georgia', 'serif'].join(','),
        fontSize: '1.875rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
      },
      h3: {
        fontFamily: ['"Newsreader"', '"Plus Jakarta Sans"', 'Georgia', 'serif'].join(','),
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.1875rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      h5: { fontSize: '1rem', fontWeight: 600 },
      h6: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
      subtitle1: { fontSize: '0.9375rem', fontWeight: 500 },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 500, color: isDark ? KALAM_TOKENS.darkMutedText : KALAM_TOKENS.mutedText },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem', letterSpacing: '0.02em' },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '8px 18px',
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(23, 23, 23, 0.08)',
            },
          },
          containedPrimary: {
            backgroundColor: isDark ? '#FAF7F0' : KALAM_TOKENS.inkBlack,
            color: isDark ? KALAM_TOKENS.inkBlack : '#FFFFFF',
            '&:hover': {
              backgroundColor: isDark ? '#FFFFFF' : '#333333',
            },
          },
          containedSecondary: {
            backgroundColor: KALAM_TOKENS.saffron,
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: KALAM_TOKENS.saffronHover,
            },
          },
          outlinedPrimary: {
            borderColor: isDark ? KALAM_TOKENS.darkBorder : KALAM_TOKENS.warmSand,
            color: isDark ? '#FAF7F0' : KALAM_TOKENS.inkBlack,
            '&:hover': {
              borderColor: isDark ? '#FAF7F0' : KALAM_TOKENS.inkBlack,
              backgroundColor: isDark ? 'rgba(250, 247, 240, 0.04)' : 'rgba(23, 23, 23, 0.04)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? KALAM_TOKENS.darkPaper : KALAM_TOKENS.surfaceWhite,
            border: isDark ? `1px solid ${KALAM_TOKENS.darkBorder}` : `1px solid ${KALAM_TOKENS.warmSand}`,
            boxShadow: isDark
              ? '0 2px 10px rgba(0, 0, 0, 0.35)'
              : '0 1px 3px rgba(23, 23, 23, 0.03), 0 4px 16px rgba(23, 23, 23, 0.02)',
            borderRadius: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? KALAM_TOKENS.darkPaper : KALAM_TOKENS.surfaceWhite,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#141210' : '#FFFFFF',
            borderRight: isDark ? `1px solid ${KALAM_TOKENS.darkBorder}` : `1px solid ${KALAM_TOKENS.warmSand}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: isDark ? KALAM_TOKENS.darkMutedText : KALAM_TOKENS.mutedText,
            backgroundColor: isDark ? '#1A1816' : KALAM_TOKENS.warmIvory,
            borderBottom: isDark ? `1px solid ${KALAM_TOKENS.darkBorder}` : `1px solid ${KALAM_TOKENS.warmSand}`,
          },
          body: {
            fontSize: '0.875rem',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #F3EDE2',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 5,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
            '& fieldset': {
              borderColor: isDark ? KALAM_TOKENS.darkBorder : KALAM_TOKENS.warmSand,
            },
            '&:hover fieldset': {
              borderColor: isDark ? KALAM_TOKENS.darkMutedText : '#C5BBAE',
            },
            '&.Mui-focused fieldset': {
              borderColor: KALAM_TOKENS.saffron,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 44,
            '&.Mui-selected': {
              color: KALAM_TOKENS.saffron,
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
