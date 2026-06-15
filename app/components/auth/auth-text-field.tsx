import { TextField, type TextFieldProps } from '@mui/material';

type AuthTextFieldProps = Omit<TextFieldProps, 'variant'>;

export default function AuthTextField(props: AuthTextFieldProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      sx={{
        ...props.sx,
        '& .MuiInputBase-input': {
          color: '#f4f4f5',
        },
        '& .MuiInputLabel-root': {
          color: '#a1a1aa',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#ffffff',
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.18)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.38)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#ffffff',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: 'rgba(244, 244, 245, 0.55)',
        },
      }}
    />
  );
}
