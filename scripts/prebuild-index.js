#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function buildMetadataIndex() {
  console.log('🚀 Building cricket match metadata index...');
  const startTime = Date.now();
  
  const dataDir = path.join(process.cwd(), 'data');
  const indexPath = path.join(dataDir, '.match-index.json');
  
  try {
    await fs.access(dataDir);
  } catch {
    console.error('❌ Data directory not found');
    process.exit(1);
  }
  
  const allFiles = await fs.readdir(dataDir);
  const jsonFiles = allFiles.filter(file => 
    file.endsWith('.json') && 
    file !== '.DS_Store' && 
    !file.startsWith('.') &&
    file !== '.match-index.json'
  );

  console.log(`📁 Found ${jsonFiles.length} JSON files to process`);

  const metadata = [];
  const matchTypes = new Set();
  const years = new Set();
  
  // Process files in batches for better memory management
  const BATCH_SIZE = 100;
  for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
    const batch = jsonFiles.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (file) => {
      try {
        const filePath = path.join(dataDir, file);
        const stats = await fs.stat(filePath);
        
        // Read only first 8KB to get metadata efficiently
        const fileHandle = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(Math.min(8192, stats.size));
        await fileHandle.read(buffer, 0, buffer.length, 0);
        await fileHandle.close();
        
        const partialContent = buffer.toString('utf-8');
        
        let matchData;
        try {
          // Try to parse partial content
          matchData = JSON.parse(partialContent);
        } catch {
          // If partial content isn't complete JSON, read the full file
          const fullContent = await fs.readFile(filePath, 'utf-8');
          matchData = JSON.parse(fullContent);
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
        console.error(`❌ Error processing file ${file}:`, error.message);
      }
    }));
    
    // Progress indicator
    const processed = Math.min(i + BATCH_SIZE, jsonFiles.length);
    const percentage = Math.round((processed / jsonFiles.length) * 100);
    console.log(`⚡ Processed ${processed}/${jsonFiles.length} files (${percentage}%)`);
  }

  // Sort metadata by date (latest first)
  metadata.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const indexData = {
    metadata,
    matchTypes: Array.from(matchTypes).sort(),
    years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
    totalCount: metadata.length,
    lastUpdated: Date.now()
  };

  // Save index to disk
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));

  const duration = Date.now() - startTime;
  console.log(`✅ Metadata index created successfully!`);
  console.log(`📊 ${metadata.length} matches indexed`);
  console.log(`🏏 Match types: ${indexData.matchTypes.join(', ')}`);
  console.log(`📅 Years: ${indexData.years.join(', ')}`);
  console.log(`⏱️  Build time: ${duration}ms`);
  console.log(`💾 Index saved to: ${indexPath}`);
}

// Run the script
buildMetadataIndex().catch(error => {
  console.error('❌ Failed to build metadata index:', error);
  process.exit(1);
}); 