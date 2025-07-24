import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Box, Typography } from '@mui/material';

export default function EuroConfetti() {
  useEffect(() => {
    // Большой фейерверк по центру
    confetti({
      particleCount: 650,
      spread: 300,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#FFD700', '#4caf50', '#1976D2', '#f44336', '#9c27b0'],
    });

    // Фейерверки по сторонам
    setTimeout(() => {
      confetti({
        particleCount: 650,
        spread: 200,
        origin: { y: 0.6, x: 0.2 },
        colors: ['#FFD700', '#4caf50', '#1976D2', '#f44336', '#9c27b0'],
      });
    }, 300);

    setTimeout(() => {
      confetti({
        particleCount: 600,
        spread: 200,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#FFD700', '#4caf50', '#1976D2', '#f44336', '#9c27b0'],
      });
    }, 300);
  }, []);

  // Отображаем анимированные буквы MOTOPP
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {'Congratulations!'.split('').map((letter, index) => (
        <Typography
          key={index}
          variant="h1"
          sx={{
            color: index % 2 === 0 ? '#6181c3ff' : '#1eb4ddff',
            fontWeight: 'bold',
            fontSize: '5rem',
            animation: `letterFadeInOut 3s ${index * 0.2}s forwards`,
            opacity: 0,
            transform: 'translateY(50px)',
            '@keyframes letterFadeInOut': {
              '0%': {
                opacity: 0,
                transform: 'translateY(50px) scale(0.5)',
              },
              '20%': {
                opacity: 1,
                transform: 'translateY(-20px) scale(1.2)',
              },
              '40%': {
                transform: 'translateY(0) scale(1)',
              },
              '80%': {
                transform: 'translateY(-10px) scale(1.1)',
              },
              '99%': {
                transform: 'translateY(0) scale(1)',
                opacity: 1,
              },
              '100%': {
                transform: 'translateY(0) scale(1)',
                opacity: 0.8,
              },
            },
          }}
        >
          {letter}
        </Typography>
      ))}
    </Box>
  );
}
