#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientSrcDir = path.join(rootDir, 'client', 'src');

// Extensions that need to be added
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Filetypes to process
const fileTypesToProcess = ['.ts', '.tsx', '.js', '.jsx'];

// Count of files processed and imports updated
let filesProcessed = 0;
let importsUpdated = 0;

// Process a single file
function processFile(filePath) {
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Update relative imports that don't have an extension
  content = content.replace(/from\s+['"](\.\/[^'"]*|\.\.\/[^'"]*)['"]/g, (match, importPath) => {
    // Skip if it already has a supported extension
    if (extensions.some(ext => importPath.endsWith(ext))) {
      return match;
    }
    
    // Add .js extension to the import
    importsUpdated++;
    return `from '${importPath}.js'`;
  });
  
  // Update alias imports for @/components, @/hooks, @/pages, etc.
  // Just for inspection, we'll collect these but not replace them yet
  const aliasImports = [];
  content.replace(/from\s+['"]([@][^'"]*)['"]/g, (match, importPath) => {
    aliasImports.push(importPath);
    return match;
  });
  
  // For @/ imports, we need to handle them differently since they're path aliases
  // We'll log them for now to understand the structure
  if (aliasImports.length > 0) {
    console.log(`Found alias imports in ${filePath}: ${aliasImports.join(', ')}`);
  }
  
  // Write file if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesProcessed++;
    console.log(`Updated imports in: ${filePath}`);
  }
}

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
console.log('Starting to process client-side code...');
walkDir(clientSrcDir);
console.log(`Finished processing ${filesProcessed} files with ${importsUpdated} import statements updated.`);
