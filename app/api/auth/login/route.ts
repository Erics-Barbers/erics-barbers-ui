import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json();

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!apiRes.ok) {
    const err = await apiRes.json().catch(() => ({}));
    return NextResponse.json(err, { status: apiRes.status });
  }

  const data = await apiRes.json();

  // Store access token on the UI domain (HttpOnly)
  (await cookies()).set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  return NextResponse.json({ message: 'Logged in' }, { status: 200 });
}
