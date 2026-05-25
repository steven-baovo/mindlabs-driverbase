const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Preparing Next.js project for Tauri Static Export ---');

const backupRegistry = [];

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

try {
  // Step 1: Scan for all files containing 'use server' or "use server"
  const srcDir = path.join(__dirname, '..', 'src');
  const allFiles = getFilesRecursively(srcDir);
  
  const actionFiles = allFiles.filter(filePath => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
      return false;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes("'use server'") || content.includes('"use server"');
  });

  console.log(`Found ${actionFiles.length} Server Action file(s) to stub.`);

  // Step 2: Backup and stub each Server Action file
  actionFiles.forEach(filePath => {
    const backupPath = filePath + '.bak';
    console.log(`- Backing up: ${path.basename(filePath)}`);
    fs.renameSync(filePath, backupPath);
    backupRegistry.push({ original: filePath, backup: backupPath });

    // Read backup content and parse exported items
    const originalContent = fs.readFileSync(backupPath, 'utf8');
    const exportedNames = new Set();
    
    // Match: export async function name(...) or export function name(...)
    const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = funcRegex.exec(originalContent)) !== null) {
      exportedNames.add(match[1]);
    }
    
    // Match: export const name = ...
    const constRegex = /export\s+const\s+(\w+)/g;
    while ((match = constRegex.exec(originalContent)) !== null) {
      exportedNames.add(match[1]);
    }

    // Write stub file
    let stubContent = `// Stubbed for Tauri Static Export\n`;
    exportedNames.forEach(name => {
      stubContent += `export async function ${name}() { return { data: null, error: null }; }\n`;
    });

    fs.writeFileSync(filePath, stubContent.trim());
    console.log(`  Stubbed ${exportedNames.size} exported action(s).`);
  });

  // Step 3: Handle the dynamic /auth/callback Route Handler
  const callbackRoutePath = path.join(__dirname, '..', 'src', 'app', 'auth', 'callback', 'route.ts');
  if (fs.existsSync(callbackRoutePath)) {
    const callbackBackupPath = callbackRoutePath + '.bak';
    console.log(`- Backing up dynamic route handler: auth/callback`);
    fs.renameSync(callbackRoutePath, callbackBackupPath);
    backupRegistry.push({ original: callbackRoutePath, backup: callbackBackupPath });

    const dummyContent = `
export const dynamic = 'force-static';
export async function GET() {
  return new Response(JSON.stringify({ message: "Auth callback not supported in offline desktop app" }), {
    headers: { 'content-type': 'application/json' }
  });
}
`;
    fs.writeFileSync(callbackRoutePath, dummyContent.trim());
  }

  // Step 3.5: Handle the dynamic /account page that uses server-side cookies
  const accountPagePath = path.join(__dirname, '..', 'src', 'app', '(frontend)', 'account', 'page.tsx');
  if (fs.existsSync(accountPagePath)) {
    const accountBackupPath = accountPagePath + '.bak';
    console.log(`- Backing up dynamic page: (frontend)/account/page.tsx`);
    fs.renameSync(accountPagePath, accountBackupPath);
    backupRegistry.push({ original: accountPagePath, backup: accountBackupPath });

    const dummyContent = `
import React from 'react';
export const metadata = {
  title: 'Cài đặt tài khoản | Mindlabs',
};
export default function AccountPage() {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 md:px-6 text-center">
      <div className="mb-8 border-b border-[#e5e5e5] pb-6">
        <h1 className="text-3xl font-bold text-[#1a2b49] mb-2">Cài đặt tài khoản</h1>
        <p className="text-gray-500">Tính năng chỉnh sửa tài khoản hiện chỉ hỗ trợ khi kết nối mạng.</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(accountPagePath, dummyContent.trim());
  }

  // Step 4: Run the Next.js production build with TAURI_BUILD=true
  console.log('Running Next.js static build...');
  execSync('npx cross-env TAURI_BUILD=true next build --webpack', {
    stdio: 'inherit',
    env: { ...process.env, TAURI_BUILD: 'true' }
  });

  console.log('Next.js static export build completed successfully.');

} catch (error) {
  console.error('Build failed with error:', error.message);
  process.exitCode = 1;
} finally {
  // Step 5: Restore all original files from backup
  console.log('--- Restoring original files from backup ---');
  backupRegistry.forEach(({ original, backup }) => {
    if (fs.existsSync(backup)) {
      if (fs.existsSync(original)) {
        fs.unlinkSync(original);
      }
      fs.renameSync(backup, original);
      console.log(`- Restored: ${path.basename(original)}`);
    }
  });
  console.log('Restoration complete.');
}
