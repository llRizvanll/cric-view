import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CricketMatch } from '../../models/CricketMatchModel';

// Enhanced caching system for better performance
interface MatchMetadata {
  matchId: string;
  filename: string;
  matchType: string;
  date: string;
  year: string;
  teams: string[];
  venue?: string;
  city?: string;
  event?: string;
  season?: string;
  outcome?: any;
  fileSize: number;
  lastModified: number;
}

interface CacheData {
  metadata: MatchMetadata[];
  matchTypes: string[];
  years: string[];
  totalCount: number;
  lastUpdated: number;
}

// Global cache with TTL
let globalCache: CacheData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const INDEX_FILE_PATH = path.join(process.cwd(), 'data', '.match-index.json');

// Build metadata index from all files (only run when cache is empty or expired)
async function buildMetadataIndex(): Promise<CacheData> {
  console.log('Building metadata index...');
  const startTime = Date.now();
  
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
    !file.startsWith('.') &&
    file !== '.match-index.json'
  );

  const metadata: MatchMetadata[] = [];
  const matchTypes = new Set<string>();
  const years = new Set<string>();
  
  // Process files in batches for better memory management
  const BATCH_SIZE = 50;
  for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
    const batch = jsonFiles.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (file) => {
      try {
        const filePath = path.join(dataDir, file);
        const stats = await fs.stat(filePath);
        
        // Read only the first part of the file to get metadata
        const fileHandle = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(Math.min(8192, stats.size)); // Read first 8KB
        await fileHandle.read(buffer, 0, buffer.length, 0);
        await fileHandle.close();
        
        const partialContent = buffer.toString('utf-8');
        
        // Try to extract just the info section using regex
        let matchData;
        try {
          // First try to parse if we got complete JSON in first 8KB
          matchData = JSON.parse(partialContent);
        } catch {
          // If not complete, try to extract just the info section
          const infoMatch = partialContent.match(/"info":\s*{[^}]*"dates":\s*\[[^]]*\][^}]*}/);
          if (infoMatch) {
            try {
              matchData = { info: JSON.parse(infoMatch[0].substring(7)) }; // Remove "info":
            } catch {
              // Fallback: read the full file (slower but accurate)
              const fullContent = await fs.readFile(filePath, 'utf-8');
              matchData = JSON.parse(fullContent);
            }
          } else {
            // Fallback: read the full file
            const fullContent = await fs.readFile(filePath, 'utf-8');
            matchData = JSON.parse(fullContent);
          }
        }
        
        if (matchData?.info) {
          const info = matchData.info;
          const matchType = info.match_type || 'Unknown';
          const date = info.dates?.[0] || '';
          const year = date ? new Date(date).getFullYear().toString() : '';
          
          matchTypes.add(matchType);
          if (year) years.add(year);
          
          metadata.push({
            matchId: file.replace('.json', ''),
            filename: file,
            matchType,
            date,
            year,
            teams: info.teams || [],
            venue: info.venue,
            city: info.city,
            event: info.event?.name || info.event,
            season: info.season,
            outcome: info.outcome,
            fileSize: stats.size,
            lastModified: stats.mtime.getTime()
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }));
    
    // Log progress every 500 files
    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= jsonFiles.length) {
      console.log(`Processed ${Math.min(i + BATCH_SIZE, jsonFiles.length)}/${jsonFiles.length} files`);
    }
  }

  // Sort metadata by date (latest first)
  metadata.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const cacheData: CacheData = {
    metadata,
    matchTypes: Array.from(matchTypes).sort(),
    years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
    totalCount: metadata.length,
    lastUpdated: Date.now()
  };

  // Save index to disk for faster subsequent loads
  try {
    await fs.writeFile(INDEX_FILE_PATH, JSON.stringify(cacheData, null, 2));
    console.log(`Metadata index saved to disk (${metadata.length} matches)`);
  } catch (error) {
    console.error('Failed to save index to disk:', error);
  }

  const duration = Date.now() - startTime;
  console.log(`Metadata index built in ${duration}ms for ${metadata.length} matches`);
  
  return cacheData;
}

// Load metadata index from disk or build new one
async function getMetadataIndex(): Promise<CacheData> {
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (globalCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached metadata index');
    return globalCache;
  }

  try {
    // Try to load from disk first
    const indexContent = await fs.readFile(INDEX_FILE_PATH, 'utf-8');
    const diskCache: CacheData = JSON.parse(indexContent);
    
    // Check if disk cache is recent enough (24 hours)
    const DISK_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    if ((now - diskCache.lastUpdated) < DISK_CACHE_DURATION) {
      console.log(`Loaded metadata index from disk (${diskCache.metadata.length} matches)`);
      globalCache = diskCache;
      cacheTimestamp = now;
      return diskCache;
    } else {
      console.log('Disk cache expired, rebuilding index...');
    }
  } catch (error) {
    console.log('No disk cache found or error reading it, building new index...');
  }

  // Build new index
  const newCache = await buildMetadataIndex();
  globalCache = newCache;
  cacheTimestamp = now;
  
  return newCache;
}

// Load individual match data when needed
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const matchTypeFilter = searchParams.get('match_type');
    const yearFilter = searchParams.get('year');
    const offset = (page - 1) * limit;

    console.log(`API Request: page=${page}, limit=${limit}, filter=${matchTypeFilter}, year=${yearFilter}`);

    // Get metadata index (very fast now)
    const cacheData = await getMetadataIndex();
    
    if (cacheData.metadata.length === 0) {
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
        availableYears: [],
        currentFilter: 'all',
        currentYear: 'all'
      });
    }

    // Filter metadata (very fast - no file I/O)
    let filteredMetadata = cacheData.metadata;
    
    if (matchTypeFilter && matchTypeFilter !== 'all') {
      filteredMetadata = filteredMetadata.filter(meta => 
        meta.matchType.toLowerCase() === matchTypeFilter.toLowerCase()
      );
    }
    
    if (yearFilter && yearFilter !== 'all') {
      filteredMetadata = filteredMetadata.filter(meta => meta.year === yearFilter);
    }

    // Apply pagination to filtered metadata
    const total = filteredMetadata.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedMetadata = filteredMetadata.slice(offset, offset + limit);
    
    // Now load only the required match files (much faster!)
    const matchPromises = paginatedMetadata.map(meta => loadMatchFromFile(meta.filename));
    const matches = await Promise.all(matchPromises);
    const validMatches = matches.filter(match => match !== null) as CricketMatch[];

    console.log(`Loaded ${validMatches.length} matches for page ${page} in optimized mode (filter: ${matchTypeFilter || 'all'}, year: ${yearFilter || 'all'})`);

    return NextResponse.json({
      matches: validMatches,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      availableMatchTypes: cacheData.matchTypes,
      availableYears: cacheData.years,
      currentFilter: matchTypeFilter || 'all',
      currentYear: yearFilter || 'all'
    });
    
  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: `Failed to load matches: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 