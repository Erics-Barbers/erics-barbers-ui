import Form from 'next/form';
import { TextField, Button } from '@mui/material';

export default function RegisterForm() {
  return (
    <Form action="">
      <div className="flex flex-col gap-4 mx-auto mt-10">
        <TextField label="Email" type="email" variant="outlined" />
        <TextField label="Password" type="password" variant="outlined" />
        <Button type="submit" variant="contained" color="primary">
          Register
        </Button>
      </div>
    </Form>
  );
}
