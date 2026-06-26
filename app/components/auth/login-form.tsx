import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import Link from 'next/link';
import Form from 'next/form';
import React from 'react';

interface LoginFormProps {
  forgotPasswordHref: string;
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  submitting?: boolean;
}

export default function LoginForm(props: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onLogin(email, password, rememberMe);
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
      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          checked={rememberMe}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-zinc-50 accent-zinc-50"
          disabled={props.submitting}
          onChange={(e) => setRememberMe(e.target.checked)}
          type="checkbox"
        />
        Keep me signed in
      </label>
      <Link
        className="self-start text-sm font-medium text-zinc-50 underline underline-offset-4"
        href={props.forgotPasswordHref}
      >
        Forgot password?
      </Link>
      <AuthSubmitButton loading={props.submitting}>Log in</AuthSubmitButton>
    </Form>
  );
}
