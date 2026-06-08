import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/send-verification-email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}
