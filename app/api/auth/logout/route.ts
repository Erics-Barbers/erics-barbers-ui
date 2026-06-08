import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  const refreshToken = cookieStore.get('refreshToken')?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (refreshToken && apiBaseUrl) {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    }).catch(() => null);
  }

  cookieStore.set('accessToken', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ message: 'Logged out' }, { status: 200 });
}
