import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CricketMatch } from '../../models/CricketMatchModel';

// In-memory cache for file list and match types
let fileListCache: string[] | null = null;
let matchTypesCache: Set<string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getFileList(): Promise<{ files: string[], matchTypes: Set<string> }> {
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (fileListCache && matchTypesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return { files: fileListCache, matchTypes: matchTypesCache };
  }

  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    await fs.access(dataDir);
  } catch {
    throw new Error('Data directory not found');
  }
  
  const allFiles = await fs.readdir(dataDir);
  const jsonFiles = allFiles.filter(file => 
    file.endsWith('.json') && 
    file !== '.DS_Store' && 
    !file.startsWith('.')
  );

  // Build match types cache by reading a sample of files
  const matchTypes = new Set<string>();
  const sampleSize = Math.min(100, jsonFiles.length); // Sample first 100 files for match types
  
  for (let i = 0; i < sampleSize; i++) {
    try {
      const filePath = path.join(dataDir, jsonFiles[i]);
      const content = await fs.readFile(filePath, 'utf-8');
      const matchData = JSON.parse(content);
      
      if (matchData.info?.match_type) {
        matchTypes.add(matchData.info.match_type);
      }
    } catch (error) {
      console.error(`Error sampling file ${jsonFiles[i]}:`, error);
    }
  }

  // Cache the results
  fileListCache = jsonFiles;
  matchTypesCache = matchTypes;
  cacheTimestamp = now;

  return { files: jsonFiles, matchTypes };
}

async function loadMatchFromFile(filename: string): Promise<CricketMatch | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const matchData = JSON.parse(content);
    
    return {
      matchId: filename.replace('.json', ''),
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
  } catch (error) {
    console.error(`Error loading file ${filename}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const matchTypeFilter = searchParams.get('match_type');
    const offset = (page - 1) * limit;

    console.log(`API Request: page=${page}, limit=${limit}, filter=${matchTypeFilter}`);

    // Get cached file list and match types
    const { files: allFiles, matchTypes } = await getFileList();
    
    if (allFiles.length === 0) {
      return NextResponse.json({
        matches: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        availableMatchTypes: [],
        currentFilter: 'all'
      });
    }

    // If no filter is applied, use simple file-based pagination
    if (!matchTypeFilter || matchTypeFilter === 'all') {
      const totalFiles = allFiles.length;
      const totalPages = Math.ceil(totalFiles / limit);
      const paginatedFiles = allFiles.slice(offset, offset + limit);
      
      // Load only the files for this page
      const matches = [];
      for (const file of paginatedFiles) {
        const matchData = await loadMatchFromFile(file);
        if (matchData) {
          matches.push(matchData);
        }
      }

      console.log(`Loaded ${matches.length} matches for page ${page} (no filter)`);

      return NextResponse.json({
        matches,
        pagination: {
          total: totalFiles,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        availableMatchTypes: Array.from(matchTypes).sort(),
        currentFilter: 'all'
      });
    }

    // For filtered requests, we need to check files to apply the filter
    // This is more expensive but necessary for accurate pagination
    console.log(`Filtering for match type: ${matchTypeFilter}`);
    
    const filteredMatches = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    // Process files in batches to avoid loading too many at once
    for (const file of allFiles) {
      if (filteredMatches.length >= offset + limit) {
        break; // We have enough matches
      }
      
      const matchData = await loadMatchFromFile(file);
      processedCount++;
      
      if (matchData && matchData.info.match_type?.toLowerCase() === matchTypeFilter.toLowerCase()) {
        if (filteredMatches.length >= offset) {
          // We're in the target page range
          filteredMatches.push(matchData);
        } else {
          // Count this match but don't include it (it's before our target page)
          skippedCount++;
        }
      }

      // Every 50 files, log progress
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${allFiles.length} files, found ${filteredMatches.length + skippedCount} matches`);
      }
    }

    // Calculate pagination info for filtered results
    const totalFilteredMatches = filteredMatches.length + skippedCount;
    const totalPages = Math.ceil(totalFilteredMatches / limit);
    const actualMatches = filteredMatches.slice(0, limit);

    console.log(`Filtering complete: ${actualMatches.length} matches for page ${page}, total filtered: ${totalFilteredMatches}`);

    return NextResponse.json({
      matches: actualMatches,
      pagination: {
        total: totalFilteredMatches,
        page,
        limit,
        totalPages,
        hasNext: filteredMatches.length === limit, // Simple heuristic
        hasPrev: page > 1
      },
      availableMatchTypes: Array.from(matchTypes).sort(),
      currentFilter: matchTypeFilter
    });
    
  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: `Failed to load matches: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 