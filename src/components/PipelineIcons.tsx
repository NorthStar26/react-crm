import React from 'react';
import { Box, SvgIcon, SxProps, Theme } from '@mui/material';

// Базовый стиль для круглой иконки с цветным фоном
const baseIconContainerStyle = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
};

// Стили для различных состояний иконок пайплайна
export const pipelineIconStyles = {
  completed: {
    container: {
      ...baseIconContainerStyle,
      backgroundColor: '#43A047', // Зеленый фон для завершенных этапов
    },
  },
  active: {
    container: {
      ...baseIconContainerStyle,
      backgroundColor: '#339AF0', // Голубой фон для текущего этапа
    },
  },
  pending: {
    container: {
      ...baseIconContainerStyle,
      backgroundColor: 'rgba(0, 0, 0, 0.23)', // Серый фон для будущих этапов
    },
  },
};

// Иконка галочки для завершенного этапа
export const CheckMarkIcon = (props: { sx?: SxProps<Theme> }) => (
  <SvgIcon sx={props.sx} viewBox="0 0 24 24">
    <path
      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
      fill="currentColor"
    />
  </SvgIcon>
);

// Иконка заполненных песочных часов для текущего этапа
export const TimerSandIcon = (props: { sx?: SxProps<Theme> }) => (
  <SvgIcon sx={props.sx} viewBox="0 0 24 24">
    <path
      d="M6 2V8H6.01L6 16H6.01L6 22H18V16H17.99L18 8H17.99L18 2H6ZM16 16.5V20H8V16.5C8 14.17 9.34 12.16 11.5 11.5C9.34 10.84 8 8.83 8 6.5V4H16V6.5C16 8.83 14.66 10.84 12.5 11.5C14.66 12.16 16 14.17 16 16.5Z"
      fill="currentColor"
    />
  </SvgIcon>
);

// Иконка пустых песочных часов для будущих этапов
export const TimerSandEmptyIcon = (props: { sx?: SxProps<Theme> }) => (
  <SvgIcon sx={props.sx} viewBox="0 0 24 24">
    <path
      d="M6 2V8H6.01L6 16H6.01L6 22H18V16H17.99L18 8H17.99L18 2H6ZM16 4V6.5C16 8.83 14.66 10.84 12.5 11.5C14.66 12.16 16 14.17 16 16.5V20H8V16.5C8 14.17 9.34 12.16 11.5 11.5C9.34 10.84 8 8.83 8 6.5V4H16Z"
      fill="currentColor"
    />
  </SvgIcon>
);

// Готовые компоненты иконок для различных стадий
export function CompletedStepIcon() {
  return (
    <Box sx={pipelineIconStyles.completed.container}>
      <CheckMarkIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
    </Box>
  );
}

export function CurrentStepIcon() {
  return (
    <Box sx={pipelineIconStyles.active.container}>
      <TimerSandIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
    </Box>
  );
}

export function PendingStepIcon() {
  return (
    <Box sx={pipelineIconStyles.pending.container}>
      <TimerSandEmptyIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
    </Box>
  );
}

// Стили для текста этапов пайплайна
export const pipelineStepLabelStyles = {
  active: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
    color: '#000000', // Черный для активного этапа
  },
  inactive: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
    color: '#666666', // Серый для неактивных этапов
  },
};

// Стили для линии коннектора
export const pipelineConnectorStyles = {
  line: {
    borderColor: '#e0e0e0',
    borderTopWidth: 3,
  },
  active: {
    borderColor: '#43A047',
  },
  completed: {
    borderColor: '#43A047',
  },
};
