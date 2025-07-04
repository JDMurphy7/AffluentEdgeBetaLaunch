#!/bin/bash

# Fix double .js.js extensions in agent files
find /workspaces/AffluentEdgeBetaLaunch/server/agents -type f -name "*.ts" | while read file; do
  # Replace double .js.js with single .js
  sed -i 's|\.js\.js"|\.js"|g' "$file"
  sed -i "s|\.js\.js'|\.js'|g" "$file"
  
  # Fix triple .js.js.js if any
  sed -i 's|\.js\.js\.js"|\.js"|g' "$file"
  sed -i "s|\.js\.js\.js'|\.js'|g" "$file"
  
  echo "Fixed double extensions in $file"
done

echo "Fixed all double .js.js extensions in agent files!"
