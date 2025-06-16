#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build artifacts...');

const requiredFiles = [
  '.next/BUILD_ID',
  '.next/build-manifest.json',
  '.next/app-build-manifest.json',
  '.next/server/app/page.js',
  'data/.match-index.json'
];

const requiredDirectories = [
  '.next',
  '.next/server',
  '.next/static',
  'data'
];

let hasErrors = false;

// Check directories
console.log('\n📁 Checking directories...');
requiredDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    hasErrors = true;
  }
});

// Check files
console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check BUILD_ID content
if (fs.existsSync('.next/BUILD_ID')) {
  const buildId = fs.readFileSync('.next/BUILD_ID', 'utf-8').trim();
  if (buildId && buildId.length > 0) {
    console.log(`✅ BUILD_ID content: "${buildId}"`);
  } else {
    console.log('❌ BUILD_ID is empty');
    hasErrors = true;
  }
}

// Check data files count
if (fs.existsSync('data')) {
  const dataFiles = fs.readdirSync('data').filter(f => f.endsWith('.json') && !f.startsWith('.'));
  console.log(`📊 Data files: ${dataFiles.length} JSON files found`);
  
  if (fs.existsSync('data/.match-index.json')) {
    try {
      const indexContent = JSON.parse(fs.readFileSync('data/.match-index.json', 'utf-8'));
      console.log(`📈 Index metadata: ${indexContent.metadata?.length || 0} matches indexed`);
    } catch (error) {
      console.log('❌ Index file is corrupted');
      hasErrors = true;
    }
  }
}

// Summary
console.log('\n📋 Build Verification Summary:');
if (hasErrors) {
  console.log('❌ Build verification FAILED - missing required files');
  process.exit(1);
} else {
  console.log('✅ Build verification PASSED - all files present');
  console.log('🚀 Ready for deployment!');
  process.exit(0);
} 