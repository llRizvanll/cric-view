#!/usr/bin/env node

async function testAPIPerformance() {
  const baseUrl = 'http://localhost:3000/api/matches';
  
  const testCases = [
    { name: 'First page load', url: `${baseUrl}?page=1&limit=20` },
    { name: 'ODI filter', url: `${baseUrl}?page=1&limit=20&match_type=ODI` },
    { name: 'T20 filter', url: `${baseUrl}?page=1&limit=20&match_type=T20` },
    { name: 'Year 2024 filter', url: `${baseUrl}?page=1&limit=20&year=2024` },
    { name: 'Second page', url: `${baseUrl}?page=2&limit=20` },
    { name: 'Combined filter', url: `${baseUrl}?page=1&limit=20&match_type=ODI&year=2024` },
  ];

  console.log('🚀 Testing API Performance...\n');

  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      const response = await fetch(testCase.url);
      const endTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        const duration = endTime - startTime;
        console.log(`✅ ${testCase.name}: ${duration}ms (${data.matches.length} matches)`);
      } else {
        console.log(`❌ ${testCase.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🏁 Performance test completed!');
}

// Check if server is running before testing
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/matches?page=1&limit=1');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if development server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Development server is not running or not responding');
    console.log('💡 Please run "npm run dev" first');
    process.exit(1);
  }
  
  console.log('✅ Server is running, starting performance tests...\n');
  await testAPIPerformance();
}

main().catch(error => {
  console.error('❌ Performance test failed:', error);
  process.exit(1);
}); 