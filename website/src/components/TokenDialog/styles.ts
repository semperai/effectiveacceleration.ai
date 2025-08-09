// src/components/TokenDialog/styles.ts
import { styled } from '@mui/material/styles';
import {
  DialogTitle,
  DialogContent,
  Box,
} from '@mui/material';

export const DialogWrapper = styled(Box)(({ theme }) => ({
  minWidth: '500px',
  maxWidth: '600px',
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  '& > div': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  '& h2': {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  paddingBottom: theme.spacing(1),
}));

export const ContainerListPreferredTokens = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ContainerSearchInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiInput-root': {
    fontSize: '1rem',
    '&:before': {
      borderBottom: 'none',
    },
    '&:after': {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: 'none',
    },
  },
}));

interface StyledDialogContentProps {
  $isAddCustomToken?: boolean;
  $noTokensFound?: boolean;
}

export const StyledDialogContent = styled(DialogContent, {
  shouldForwardProp: (prop) => !prop.toString().startsWith('$'),
})<StyledDialogContentProps>(({ theme, $isAddCustomToken, $noTokensFound }) => ({
  padding: 0,
  maxHeight: '400px',
  overflowY: 'auto',
  position: 'relative',

  // Hide content when adding custom token
  display: $isAddCustomToken ? 'none' : 'block',

  // Scrollbar styles
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[500],
    },
  },

  // Shadow effects for scroll indication
  '&.hidden-before::before': {
    display: 'none',
  },
  '&.hidden-after::after': {
    display: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
    pointerEvents: 'none',
    zIndex: 1,
  },

  // List styles
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiListItemButton-root': {
    padding: theme.spacing(1.5, 2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
      },
    },
  },
  '& .MuiListItemText-root': {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& .token': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      '& > span:first-of-type': {
        fontSize: '0.95rem',
        fontWeight: 500,
      },
      '& .balance': {
        fontSize: '0.85rem',
        color: theme.palette.text.secondary,
        marginTop: '2px',
      },
    },
    '& .pin': {
      marginLeft: 'auto',
      marginRight: theme.spacing(1),
      cursor: 'pointer',
      opacity: 0.6,
      transition: 'opacity 0.2s',
      '&:hover': {
        opacity: 1,
      },
      '& svg': {
        width: '18px',
        height: '18px',
      },
    },
    '& a': {
      display: 'flex',
      alignItems: 'center',
      opacity: 0.6,
      transition: 'opacity 0.2s',
      '&:hover': {
        opacity: 1,
      },
      '& svg': {
        width: '18px',
        height: '18px',
      },
    },
  },

  // No results message
  '& li.text-black': {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

interface AddTokenWrapperProps {
  isAddCustomToken?: boolean;
}

export const AddTokenWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAddCustomToken',
})<AddTokenWrapperProps>(({ theme, isAddCustomToken }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,

  '& > p': {
    margin: 0,
    padding: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontWeight: 500,
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  ...(isAddCustomToken && {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    '& .MuiInput-root': {
      fontSize: '0.95rem',
    },
    '& .MuiButton-root': {
      alignSelf: 'flex-end',
    },
  }),
}))
