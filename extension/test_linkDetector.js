// Test script for link detection
// Run this in browser console to verify regex patterns

const testLinks = [
  'https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/edit?usp=sharing',
  'https://docs.google.com/document/d/1ABC123xyz',
  'https://docs.google.com/document/d/1ABC123xyz/view',
  'https://docs.google.com/document/d/1ABC123xyz/edit',
  'Summarize this https://docs.google.com/document/d/1TEST123 please',
  'No link here'
];

const googleDocsPattern = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)(?:\/[a-z]+)?/g;

console.log('Testing Google Docs Link Detection\n');
console.log('=' .repeat(50));

testLinks.forEach((text, index) => {
  console.log(`\nTest ${index + 1}: ${text}`);
  const matches = [...text.matchAll(googleDocsPattern)];
  
  if (matches.length > 0) {
   const docId = matches[0][1];
   console.log(`✅ Detected DOC ID: ${docId}`);
  } else {
   console.log('❌ No link detected');
  }
});
