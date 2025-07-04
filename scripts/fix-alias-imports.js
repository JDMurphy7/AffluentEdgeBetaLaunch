#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientSrcDir = path.join(rootDir, 'client', 'src');

// Filetypes to process
const fileTypesToProcess = ['.ts', '.tsx', '.js', '.jsx'];

// Count of files processed and imports updated
let filesProcessed = 0;
let importsUpdated = 0;

// Helper function to calculate relative path
function getRelativePath(from, to) {
  let relativePath = path.relative(path.dirname(from), to);
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath;
}

// Process a single file
function processFile(filePath) {
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Update @/ imports
  content = content.replace(/from\s+(['"])@\/([^'"]*)['"]/g, (match, quote, importPath) => {
    // Calculate the target path
    const targetPath = path.join(clientSrcDir, importPath);
    
    // Calculate the relative path from current file to target
    const relativePath = getRelativePath(filePath, targetPath);
    
    // Add .js extension if not present
    let finalPath = relativePath;
    if (!extensions.some(ext => finalPath.endsWith(ext))) {
      finalPath += '.js';
    }
    
    importsUpdated++;
    return `from ${quote}${finalPath}${quote}`;
  });
  
  // Write file if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesProcessed++;
    console.log(`Updated @/ imports in: ${filePath}`);
  }
}

// Extensions that need to be added
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Walk through directory recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (fileTypesToProcess.includes(path.extname(filePath))) {
      processFile(filePath);
    }
  }
}

// Start processing
console.log('Starting to process @/ imports...');
walkDir(clientSrcDir);
console.log(`Finished processing ${filesProcessed} files with ${importsUpdated} import statements updated.`);
