#!/bin/bash

# Find and fix all double .js.js extensions in TypeScript files
find /workspaces/AffluentEdgeBetaLaunch -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  # Replace double .js.js with single .js
  sed -i 's|\.js\.js"|\.js"|g' "$file"
  sed -i "s|\.js\.js'|\.js'|g" "$file"
  
  # Fix triple .js.js.js if any
  sed -i 's|\.js\.js\.js"|\.js"|g' "$file"
  sed -i "s|\.js\.js\.js'|\.js'|g" "$file"
done

echo "Fixed all remaining double .js.js extensions in TypeScript files!"
