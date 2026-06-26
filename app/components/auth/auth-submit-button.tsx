import { Button } from '@mui/material';
import type React from 'react';

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

export default function AuthSubmitButton({
  children,
  disabled,
  loading,
}: AuthSubmitButtonProps) {
  return (
    <Button
      disabled={disabled}
      fullWidth
      loading={loading}
      type="submit"
      variant="contained"
      sx={{
        backgroundColor: '#ededed',
        borderRadius: '9999px',
        boxShadow: 'none',
        color: '#000',
        fontSize: '1rem',
        fontWeight: 500,
        height: 48,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#d4d4d8',
          boxShadow: 'none',
        },
        '&.Mui-disabled': {
          backgroundColor: 'rgba(237, 237, 237, 0.55)',
          color: 'rgba(0, 0, 0, 0.55)',
        },
      }}
    >
      {children}
    </Button>
  );
}
