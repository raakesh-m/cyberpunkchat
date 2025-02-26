import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // More detailed logging
    console.log('=== New Chat Message ===');
    console.log('Time:', new Date().toISOString());
    console.log('Character:', data.character);
    console.log('Message:', data.message);
    console.log('User Agent:', request.headers.get('user-agent'));
    console.log('Referer:', request.headers.get('referer'));
    console.log('=====================\n');

    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('Logging Error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}