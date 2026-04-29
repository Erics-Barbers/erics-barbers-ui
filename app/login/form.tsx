import { TextField, Button } from '@mui/material';
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
    <Form action="" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 mx-auto mt-10">
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            style: { backgroundColor: '#fff3cd', borderRadius: 12 },
          }}
          InputLabelProps={{
            shrink: true,
            style: { color: '#fff', position: 'static' },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            style: { backgroundColor: '#fff3cd', borderRadius: 12 },
          }}
          InputLabelProps={{
            shrink: true,
            style: { color: '#fff', position: 'static' },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          loading={props.submitting}
        >
          Login
        </Button>
      </div>
    </Form>
  );
}
