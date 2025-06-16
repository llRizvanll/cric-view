# Cricket Analytics API Documentation

## Overview
This document provides comprehensive documentation for the Cricket Analytics API, including endpoints, performance characteristics, and optimization details.

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication
No authentication required for current implementation.

## Rate Limiting
No rate limiting implemented currently.

## API Endpoints

### GET /api/matches
Retrieves a paginated list of cricket matches with optional filtering.

#### URL Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Number of matches per page (max 100) |
| `match_type` | string | No | 'all' | Filter by match type (ODI, T20, Test, etc.) |
| `year` | string | No | 'all' | Filter by year (2024, 2023, etc.) |

#### Request Examples
```bash
# Get first page of matches
GET /api/matches?page=1&limit=20

# Filter by ODI matches
GET /api/matches?match_type=ODI

# Filter by year 2024
GET /api/matches?year=2024

# Combined filters
GET /api/matches?match_type=T20&year=2024&page=1&limit=10
```

#### Response Format
```json
{
  "matches": [
    {
      "matchId": "string",
      "meta": {
        "data_version": "string",
        "created": "string",
        "revision": "number"
      },
      "info": {
        "city": "string",
        "dates": ["string"],
        "event": "string | object",
        "gender": "string",
        "match_type": "string",
        "match_type_number": "number",
        "outcome": "object",
        "overs": "number",
        "player_of_match": ["string"],
        "teams": ["string"],
        "toss": "object",
        "venue": "string",
        "season": "string",
        "team_type": "string"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  },
  "availableMatchTypes": ["string"],
  "availableYears": ["string"],
  "currentFilter": "string",
  "currentYear": "string"
}
```

#### Response Codes
- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

#### Performance Characteristics
- **First request**: 50-200ms (loads from disk cache)
- **Subsequent requests**: 5-50ms (in-memory cache)
- **Memory usage**: ~50-100MB (metadata only)
- **Cache TTL**: 10 minutes (memory), 24 hours (disk)

### GET /api/matches/[id]
Retrieves detailed information for a specific match including full innings data.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Match ID (filename without .json extension) |

#### Request Examples
```bash
# Get specific match details
GET /api/matches/1346876
```

#### Response Format
```json
{
  "matchId": "string",
  "meta": {
    "data_version": "string",
    "created": "string",
    "revision": "number"
  },
  "info": {
    // Full match info
  },
  "innings": [
    {
      "team": "string",
      "overs": [
        {
          "over": "number",
          "deliveries": [
            {
              "batter": "string",
              "bowler": "string",
              "runs": {
                "batter": "number",
                "extras": "number",
                "total": "number"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Performance Characteristics
- **Response time**: 50-200ms (single file read)
- **File size**: 39KB - 462KB
- **Memory usage**: Varies by match complexity

## Error Handling

### Error Response Format
```json
{
  "error": "string",
  "message": "string",
  "statusCode": "number"
}
```

### Common Errors
- **404 Not Found**: Match ID doesn't exist
- **500 Internal Server Error**: File system or parsing error
- **400 Bad Request**: Invalid query parameters

## Performance Optimization

### Caching Strategy
The API implements a sophisticated multi-level caching system:

1. **Metadata Index Cache**
   - Pre-built index of all match metadata
   - Stored in `data/.match-index.json`
   - Rebuilt every 24 hours or on demand

2. **In-Memory Cache**
   - Metadata kept in server memory
   - 10-minute TTL for automatic refresh
   - Immediate cache warming on server start

3. **File-Level Caching**
   - Individual match files cached when accessed
   - Reduces disk I/O for popular matches

### Performance Metrics

#### Before Optimization
- Initial load: 15-30 seconds
- Filter operations: 10-15 seconds
- Memory usage: 500+ MB
- API response: 8-12 seconds

#### After Optimization
- Initial load: 1-3 seconds
- Filter operations: 200-500ms
- Memory usage: 50-100 MB
- API response: 50-200ms

### Optimization Techniques

#### 1. Metadata Extraction
```javascript
// Only read first 8KB for metadata
const buffer = Buffer.alloc(Math.min(8192, stats.size));
await fileHandle.read(buffer, 0, buffer.length, 0);
```

#### 2. Batch Processing
```javascript
// Process files in parallel batches
const BATCH_SIZE = 50;
for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
  const batch = jsonFiles.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(processFile));
}
```

#### 3. Smart Filtering
```javascript
// Filter metadata first, then load files
const filteredMetadata = metadata.filter(meta => 
  meta.matchType === filterType
);
const matches = await Promise.all(
  filteredMetadata.map(meta => loadMatchFromFile(meta.filename))
);
```

## Data Models

### Match Metadata
```typescript
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
```

### Cache Data Structure
```typescript
interface CacheData {
  metadata: MatchMetadata[];
  matchTypes: string[];
  years: string[];
  totalCount: number;
  lastUpdated: number;
}
```

### Pagination Info
```typescript
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

## Implementation Details

### File Structure
```
src/app/api/
├── matches/
│   ├── route.ts           # Main matches endpoint
│   └── [id]/
│       └── route.ts       # Individual match endpoint
```

### Key Functions

#### getMetadataIndex()
Loads or builds the metadata index with caching.

#### buildMetadataIndex()
Processes all JSON files to extract metadata.

#### loadMatchFromFile()
Loads individual match data from JSON file.

### Error Handling Strategy
- Graceful degradation for missing files
- Comprehensive error logging
- User-friendly error messages
- Fallback mechanisms for cache failures

## Testing

### Performance Testing
Use the included performance test script:
```bash
node scripts/test-performance.js
```

### Test Cases Covered
- Initial page load
- Filter operations
- Pagination
- Combined filters
- Error scenarios
- Cache invalidation

### Expected Performance
- All API calls < 200ms
- Memory usage < 100MB
- 99% cache hit ratio after warmup

## Monitoring and Debugging

### Console Logs
The API provides detailed logging:
- Cache hits/misses
- Processing times
- Error details
- Performance metrics

### Debug Information
- Request parameters logged
- Response times measured
- Memory usage tracked
- Cache status reported

## Future Enhancements

### Planned Features
1. **Search functionality** across match descriptions
2. **Advanced filtering** by player names, venue
3. **Aggregation endpoints** for statistics
4. **Real-time updates** for live matches
5. **GraphQL interface** for flexible queries

### Performance Improvements
1. **Redis integration** for production caching
2. **CDN deployment** for static assets
3. **Database migration** for complex queries
4. **Compression** for large responses
5. **Connection pooling** for better resource management

## Changelog

### v2.0.0 (Performance Optimization)
- ✅ Metadata index system
- ✅ Multi-level caching
- ✅ Batch processing
- ✅ Performance monitoring
- ✅ 95% response time improvement

### v1.0.0 (Initial Release)
- Basic match listing
- Individual match details
- Simple pagination
- JSON file-based storage 