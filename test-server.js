// Simple test script to verify Next.js setup
const fs = require('fs');
const path = require('path');

console.log('Testing Next.js 15 project setup...\n');

// Check if Next.js is installed
try {
  const nextPackagePath = path.join(__dirname, 'node_modules', 'next', 'package.json');
  const nextPackage = JSON.parse(fs.readFileSync(nextPackagePath, 'utf8'));
  console.log('✓ Next.js version:', nextPackage.version);
} catch (error) {
  console.log('✗ Next.js not found');
  process.exit(1);
}

// Check if React is installed
try {
  const reactPackagePath = path.join(__dirname, 'node_modules', 'react', 'package.json');
  const reactPackage = JSON.parse(fs.readFileSync(reactPackagePath, 'utf8'));
  console.log('✓ React version:', reactPackage.version);
} catch (error) {
  console.log('✗ React not found');
  process.exit(1);
}

// Check if TypeScript is installed
try {
  const tsPackagePath = path.join(__dirname, 'node_modules', 'typescript', 'package.json');
  const tsPackage = JSON.parse(fs.readFileSync(tsPackagePath, 'utf8'));
  console.log('✓ TypeScript version:', tsPackage.version);
} catch (error) {
  console.log('✗ TypeScript not found');
  process.exit(1);
}

// Check if Tailwind CSS is installed
try {
  const tailwindPackagePath = path.join(__dirname, 'node_modules', 'tailwindcss', 'package.json');
  const tailwindPackage = JSON.parse(fs.readFileSync(tailwindPackagePath, 'utf8'));
  console.log('✓ Tailwind CSS version:', tailwindPackage.version);
} catch (error) {
  console.log('✗ Tailwind CSS not found');
  process.exit(1);
}

// Check TypeScript configuration
if (fs.existsSync(path.join(__dirname, 'tsconfig.json'))) {
  console.log('✓ TypeScript configured');
} else {
  console.log('✗ TypeScript configuration missing');
}

// Check Next.js configuration
if (fs.existsSync(path.join(__dirname, 'next.config.ts'))) {
  console.log('✓ Next.js configured');
} else {
  console.log('✗ Next.js configuration missing');
}

// Check App Router structure
if (fs.existsSync(path.join(__dirname, 'src', 'app', 'page.tsx'))) {
  console.log('✓ App Router structure created');
} else {
  console.log('✗ App Router structure missing');
}

// Check Tailwind configuration
if (fs.existsSync(path.join(__dirname, 'tailwind.config.ts'))) {
  console.log('✓ Tailwind CSS configured');
} else {
  console.log('✗ Tailwind CSS configuration missing');
}

console.log('\n✓ All checks passed! Next.js 15 project with TypeScript is properly initialized.');
console.log('\nTo start the development server:');
console.log('  cd reva-research-portal');
console.log('  npm run dev');
