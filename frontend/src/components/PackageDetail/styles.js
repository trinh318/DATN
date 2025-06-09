import { styled } from '@mui/material/styles';
import { Card, LinearProgress, Box } from '@mui/material';

export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const FeatureProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${LinearProgress.determinate}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
  },
}));

export const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

export const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

export const ActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    '& > button': {
      width: '100%',
    },
  },
})); 