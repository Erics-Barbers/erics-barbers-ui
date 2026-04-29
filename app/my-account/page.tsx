import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyAccount() {
	// Replace 'refreshToken' with your actual cookie name
	const refreshToken = (await cookies()).get('refreshToken');
    console.log(refreshToken);
	// if (!refreshToken) {
	// 	redirect('/login');
	// }

	return (
		<div>
			<h1>My Account</h1>
			{/* Your account content here */}
		</div>
	);
}