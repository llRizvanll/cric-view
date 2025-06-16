import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const matchTypeFilter = searchParams.get('match_type');
    const offset = (page - 1) * limit;

    const dataDir = path.join(process.cwd(), 'data');
    
    // Check if data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      console.error('Data directory does not exist:', dataDir);
      return NextResponse.json(
        { error: 'Data directory not found' },
        { status: 500 }
      );
    }
    
    // Read all files in the data directory
    const files = await fs.readdir(dataDir);
    console.log('Files found:', files.length);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== '.DS_Store' && 
      !file.startsWith('.')
    );
    
    console.log('JSON files found:', jsonFiles.length);
    
    if (jsonFiles.length === 0) {
      return NextResponse.json({
        matches: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          totalPages: 0
        },
        availableMatchTypes: []
      });
    }

    // Read and parse JSON files to get all matches for filtering
    const allMatches = [];
    const matchTypes = new Set<string>();
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const matchData = JSON.parse(content);
        
        // Extract only essential data for the match list
        const essentialData = {
          matchId: file.replace('.json', ''),
          meta: {
            data_version: matchData.meta?.data_version,
            created: matchData.meta?.created,
            revision: matchData.meta?.revision
          },
          info: {
            city: matchData.info?.city,
            dates: matchData.info?.dates,
            event: matchData.info?.event,
            gender: matchData.info?.gender,
            match_type: matchData.info?.match_type,
            match_type_number: matchData.info?.match_type_number,
            outcome: matchData.info?.outcome,
            overs: matchData.info?.overs,
            player_of_match: matchData.info?.player_of_match,
            teams: matchData.info?.teams,
            toss: matchData.info?.toss,
            venue: matchData.info?.venue,
            season: matchData.info?.season,
            team_type: matchData.info?.team_type
          },
        };
        
        allMatches.push(essentialData);
        if (matchData.info?.match_type) {
          matchTypes.add(matchData.info.match_type);
        }
        
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
        // Continue with other files instead of failing completely
      }
    }

    // Apply match type filter if specified
    let filteredMatches = allMatches;
    if (matchTypeFilter && matchTypeFilter !== 'all') {
      filteredMatches = allMatches.filter(match => 
        match.info.match_type?.toLowerCase() === matchTypeFilter.toLowerCase()
      );
    }

    // Apply pagination to filtered results
    const total = filteredMatches.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedMatches = filteredMatches.slice(offset, offset + limit);
    
    console.log(`Successfully loaded ${paginatedMatches.length} matches (page ${page}/${totalPages}, filter: ${matchTypeFilter || 'all'})`);
    
    return NextResponse.json({
      matches: paginatedMatches,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      availableMatchTypes: Array.from(matchTypes).sort(),
      currentFilter: matchTypeFilter || 'all'
    });
    
  } catch (error) {
    console.error('Error reading match data:', error);
    return NextResponse.json(
      { error: `Failed to load matches: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 