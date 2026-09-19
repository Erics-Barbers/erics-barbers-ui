import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import { Checkbox, FormControlLabel } from '@mui/material';
import Form from 'next/form';
import React from 'react';

interface LoginFormProps {
  errorMessage?: string | null;
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  submitting?: boolean;
}

export default function LoginForm(props: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onLogin(email.trim(), password, rememberMe);
  };

  return (
    <Form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {props.errorMessage ? (
        <div
          className="rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-2 text-sm leading-6 text-red-100"
          role="alert"
        >
          {props.errorMessage}
        </div>
      ) : null}
      <AuthTextField
        autoComplete="email"
        disabled={props.submitting}
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        value={email}
      />
      <AuthTextField
        autoComplete="current-password"
        disabled={props.submitting}
        label="Password"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            disabled={props.submitting}
            onChange={(event) => setRememberMe(event.target.checked)}
            sx={{
              color: '#71717a',
              '&.Mui-checked': { color: '#f4f4f5' },
            }}
          />
        }
        label="Keep me signed in"
        sx={{
          alignSelf: 'flex-start',
          color: '#d4d4d8',
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
          },
        }}
      />
      <AuthSubmitButton loading={props.submitting}>Log in</AuthSubmitButton>
    </Form>
  );
}
