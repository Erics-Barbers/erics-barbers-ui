import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import Form from 'next/form';
import React from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  submitting?: boolean;
}

export default function LoginForm(props: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onLogin(email, password);
  };

  return (
    <Form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
      <AuthSubmitButton loading={props.submitting}>Log in</AuthSubmitButton>
    </Form>
  );
}
