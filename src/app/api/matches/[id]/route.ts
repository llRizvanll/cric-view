import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, `${params.id}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const matchData = JSON.parse(content);
      return NextResponse.json(matchData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading match data:', error);
    return NextResponse.json(
      { error: 'Failed to load match data' },
      { status: 500 }
    );
  }
} 