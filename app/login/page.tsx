import Link from "next/link";
import LoginForm from "./form";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Login to Your Account</h1>
      <LoginForm />
      <span className="mt-4 text-gray-600">
        Don&apos;t have an account? <Link href="/register" className="text-blue-500">Register here</Link>
      </span>
    </div>
  );
}
