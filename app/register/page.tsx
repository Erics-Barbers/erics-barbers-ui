import Link from 'next/link';
import RegisterForm from './form';

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Register Your Account</h1>
      <RegisterForm />
      <span className="mt-4 text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500">
          Login here
        </Link>
      </span>
    </div>
  );
}
