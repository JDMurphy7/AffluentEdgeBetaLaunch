#!/bin/bash

# ESM import extension fixer for TypeScript/React projects
echo "Starting ESM import extension fixer..."

# Function to add .js extension to relative imports
function fix_imports() {
  local file=$1
  echo "Processing $file..."
  
  # Use perl for the substitution because it handles multiline patterns better than sed
  perl -i -pe '
    # Add .js extension to relative imports without an extension
    s/from\s+(["\x27])(\.\/[^"\x27]+|\.\.\/[^"\x27]+)(["\x27])/from $1$2.js$3/g;
    
    # Fix dynamic imports too
    s/import\s*\(\s*(["\x27])(\.\/[^"\x27]+|\.\.\/[^"\x27]+)(["\x27])\s*\)/import($1$2.js$3)/g;
  ' "$file"
}

# Process TypeScript and React files in the client directory
find /workspaces/AffluentEdgeBetaLaunch/client/src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file
do
  fix_imports "$file"
done

echo "ESM import extension fixes completed!"
