import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
  DialogContentText,
} from '@mui/material';

export const DialogModal = (props: any) => {
  const {
    onClose,
    isDelete,
    modalDialog,
    onConfirm, // Добавляем новый проп
    confirmText = 'Yes', // Текст для кнопки подтверждения
    cancelText = 'Cancel', // Текст для кнопки отмены
  } = props;

  return (
    <Dialog onClose={() => onClose()} open={isDelete}>
      <DialogTitle
        sx={{
          padding: '15px',
          width: '500px',
          color: 'black',
        }}
      >
        {modalDialog}
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ fontSize: '14px' }}>
          {/* {props.lead.title} */}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose()}
          style={{ textTransform: 'capitalize' }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => (onConfirm ? onConfirm() : onClose())} // Используем onConfirm
          style={{
            textTransform: 'capitalize',
            backgroundColor: '#3E79F7',
            color: 'white',
            height: '30px',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
