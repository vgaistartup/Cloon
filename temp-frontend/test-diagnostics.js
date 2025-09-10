#!/usr/bin/env node

console.log("🔍 VTO App Test Diagnostics");
console.log("=".repeat(50));

// Test 1: Check critical files exist
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'app/index.tsx',
  'app/auth.tsx', 
  'app/dashboard.tsx',
  'app/upload.tsx',
  'components/Button.tsx',
  'components/Input.tsx',
  'components/Screen.tsx',
  'constants/theme.ts',
  'services/auth.ts',
  'services/upload.ts'
];

console.log("\n📁 File Existence Check:");
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check theme constants structure
console.log("\n🎨 Theme System Check:");
try {
  const theme = require('./constants/theme');
  console.log('✅ Theme module loads successfully');
  console.log('✅ Colors:', Object.keys(theme.Colors));
  console.log('✅ Typography:', Object.keys(theme.Typography));
  console.log('✅ Spacing available:', !!theme.Spacing);
} catch (error) {
  console.log('❌ Theme loading error:', error.message);
}

// Test 3: Check package.json dependencies
console.log("\n📦 Dependencies Check:");
try {
  const pkg = require('./package.json');
  const requiredDeps = ['expo', 'react', 'react-native', 'expo-router'];
  requiredDeps.forEach(dep => {
    const exists = !!pkg.dependencies[dep];
    console.log(`${exists ? '✅' : '❌'} ${dep}: ${exists ? pkg.dependencies[dep] : 'Missing'}`);
  });
} catch (error) {
  console.log('❌ Package.json error:', error.message);
}

// Test 4: Check for common TypeScript issues
console.log("\n📝 TypeScript Check:");
try {
  const tsConfig = require('./tsconfig.json');
  console.log('✅ TypeScript config loads');
  console.log('✅ Strict mode:', tsConfig.compilerOptions?.strict);
  console.log('✅ Path mapping:', !!tsConfig.compilerOptions?.paths);
} catch (error) {
  console.log('❌ TypeScript config error:', error.message);
}

console.log("\n🏁 Diagnostics Complete!");
console.log("=".repeat(50));