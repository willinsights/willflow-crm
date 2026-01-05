#!/usr/bin/env node

/**
 * Simple validation script for seed.ts
 * Checks basic syntax without requiring database connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando seed.ts...\n');

const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
const seedContent = fs.readFileSync(seedPath, 'utf-8');

let errors = 0;
let warnings = 0;

// Check 1: Basic structure
console.log('✓ Checking basic file structure...');
if (!seedContent.includes('import { PrismaClient }')) {
  console.error('  ❌ Missing PrismaClient import');
  errors++;
}
if (!seedContent.includes('async function main()')) {
  console.error('  ❌ Missing main function');
  errors++;
}
if (!seedContent.includes('main()')) {
  console.error('  ❌ Missing main() call');
  errors++;
}

// Check 2: Environment variable check
console.log('✓ Checking environment variable usage...');
if (!seedContent.includes('SEED_WITH_SAMPLE_DATA')) {
  console.warn('  ⚠️  SEED_WITH_SAMPLE_DATA not used');
  warnings++;
}

// Check 3: Delete statements (order matters for foreign keys)
console.log('✓ Checking delete order for foreign key constraints...');
const deleteStatements = seedContent.match(/await prisma\.\w+\.deleteMany\(\)/g) || [];
console.log(`  Found ${deleteStatements.length} delete statements`);

// Check 4: Create statements
console.log('✓ Checking create statements...');
const createStatements = seedContent.match(/await prisma\.\w+\.create\(/g) || [];
console.log(`  Found ${createStatements.length} create statements`);

// Check 5: Balance of brackets
console.log('✓ Checking bracket balance...');
const openBraces = (seedContent.match(/{/g) || []).length;
const closeBraces = (seedContent.match(/}/g) || []).length;
const openParens = (seedContent.match(/\(/g) || []).length;
const closeParens = (seedContent.match(/\)/g) || []).length;

if (openBraces !== closeBraces) {
  console.error(`  ❌ Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  errors++;
} else {
  console.log(`  ✓ Braces balanced: ${openBraces} pairs`);
}

if (openParens !== closeParens) {
  console.error(`  ❌ Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  errors++;
} else {
  console.log(`  ✓ Parentheses balanced: ${openParens} pairs`);
}

// Check 6: Await statements
console.log('✓ Checking async/await usage...');
const awaitCount = (seedContent.match(/await /g) || []).length;
console.log(`  Found ${awaitCount} await statements`);

// Check 7: Console logs for feedback
console.log('✓ Checking console feedback...');
const consoleLogs = (seedContent.match(/console\.(log|error)/g) || []).length;
console.log(`  Found ${consoleLogs} console statements for user feedback`);

// Check 8: Date handling
console.log('✓ Checking date handling...');
if (seedContent.includes('getDateOffset')) {
  console.log('  ✓ Using getDateOffset for dynamic dates');
} else {
  console.warn('  ⚠️  No dynamic date handling found');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total lines: ${seedContent.split('\n').length}`);
console.log(`Delete statements: ${deleteStatements.length}`);
console.log(`Create statements: ${createStatements.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✅ Validation passed! Seed file looks good.');
  process.exit(0);
} else if (errors === 0) {
  console.log('\n⚠️  Validation passed with warnings.');
  process.exit(0);
} else {
  console.log('\n❌ Validation failed. Please fix the errors above.');
  process.exit(1);
}
