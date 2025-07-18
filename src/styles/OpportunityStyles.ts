import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, TextField } from '@mui/material';

// Основной контейнер для секций
export const SectionContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow:
    '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
  borderRadius: '5px',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
}));

// Заголовок секции
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto',
  fontWeight: 600,
  fontSize: '18px',
  lineHeight: '27px',
  color: '#1A3353',
  marginBottom: theme.spacing(2),
}));

// Лейбл поля
export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto',
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: '18px',
  color: '#1A3353',
  marginBottom: theme.spacing(1),
}));

// Контейнер для поля с иконкой
export const FieldContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex', // Изменено с flex на inline-flex
  alignItems: 'center',
  gap: theme.spacing(1), // Уменьшен gap
  height: '40px',
  backgroundColor: '#F9FAFB',
  borderRadius: '4px',
  paddingLeft: theme.spacing(1.5), // Уменьшен padding
  paddingRight: theme.spacing(1.5),
  position: 'relative',
  width: 'fit-content', // Добавлено для автоматической ширины
}));

// Стилизованное поле ввода
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F9FAFB',
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Roboto',
    fontSize: '15px',
    fontWeight: 500,
    lineHeight: '18px',
    color: '#1A3353',
    padding: '8px 12px',
  },
}));

// Главный заголовок страницы
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto',
  fontWeight: 700,
  fontSize: '30px',
  lineHeight: '36px',
  color: '#101828',
}));

// Общие стили для иконок
export const iconStyles = {
  company: {
    width: 20,
    height: 20,
    color: '#4A5565',
  },
  contact: {
    width: 20,
    height: 20,
    color: '#4A5565',
  },
};

// Стили для Activities
export const ActivityItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
}));

export const ActivityAuthor = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto',
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: '20px',
  color: '#101828',
}));

export const ActivityDate = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '6px',
  padding: '4px 8px',
  '& .MuiTypography-root': {
    fontFamily: 'Roboto',
    fontSize: '12px',
    lineHeight: '16px',
    color: '#6A7282',
  },
}));

export const ActivityContent = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontFamily: 'Roboto',
  fontSize: '14px',
  lineHeight: '23px',
  color: '#364153',
}));

// Стили для выравнивания Meeting Date
export const AlignedFieldRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& > :first-of-type': {
    minWidth: '91px',
    textAlign: 'right',
    paddingRight: theme.spacing(2),
  },
  '& > :last-child': {
    flex: 1,
    maxWidth: '400px',
  },
}));
