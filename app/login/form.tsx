import { TextField, Button } from "@mui/material";
import Form from 'next/form';

export default function LoginForm() {
    return (
        <Form action="">
            <div className="flex flex-col gap-4 mx-auto mt-10">
                <TextField label="Username" variant="outlined" />
                <TextField label="Password" type="password" variant="outlined" />
                <Button type="submit" variant="contained" color="primary">
                    Login
                </Button>
            </div>
        </Form>
    );
}