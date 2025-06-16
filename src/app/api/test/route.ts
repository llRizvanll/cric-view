import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    nodeVersion: process.version
  });
} 