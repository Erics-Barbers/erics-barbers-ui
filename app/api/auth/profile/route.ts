import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (apiRes.status === 401 || apiRes.status === 403) {
    const res = NextResponse.json({ message: "Session expired" }, { status: 401 });
    res.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
    return res;
  }

  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}
