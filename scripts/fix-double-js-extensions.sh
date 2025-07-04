#!/bin/bash

# Find all TypeScript/JavaScript files in the client directory
find /workspaces/AffluentEdgeBetaLaunch/client/src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
  # Use sed to replace any .js.js double extensions with just .js
  sed -i 's/\.js\.js"/.js"/g' "$file"
  sed -i "s/\.js\.js'/.js'/g" "$file"
done

echo "Fixed double .js.js extensions in all TypeScript/JavaScript files."
