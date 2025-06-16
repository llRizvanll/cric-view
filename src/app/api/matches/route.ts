import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Read all files in the data directory
    const files = await fs.readdir(dataDir);
    
    // Filter for JSON files and read their contents
    const matches = await Promise.all(
      files
        .filter(file => file.endsWith('.json') && file !== '.DS_Store')
        .map(async file => {
          const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
          const matchData = JSON.parse(content);
          
          // Add the filename (without .json) as matchId for easier reference
          const matchId = file.replace('.json', '');
          return {
            ...matchData,
            matchId // Add this for easier ID reference
          };
        })
    );

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error reading match data:', error);
    return NextResponse.json(
      { error: 'Failed to load matches' },
      { status: 500 }
    );
  }
} 