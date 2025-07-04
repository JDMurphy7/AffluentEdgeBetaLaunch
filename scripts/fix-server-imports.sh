#!/bin/bash

# Fix imports in server files
find /workspaces/AffluentEdgeBetaLaunch/server -type f -name "*.ts" | while read file; do
  # Replace local imports without extension
  sed -i 's|import \(.*\) from "\(\..*\)"|import \1 from "\2.js"|g' "$file"
  sed -i "s|import \(.*\) from '\(\..*\)'|import \1 from '\2.js'|g" "$file"
  
  # Fix import statements with type imports
  sed -i 's|import type \(.*\) from "\(\..*\)"|import type \1 from "\2.js"|g' "$file"
  sed -i "s|import type \(.*\) from '\(\..*\)'|import type \1 from '\2.js'|g" "$file"
  
  # Fix imports with destructuring
  sed -i 's|import { \(.*\) } from "\(\..*\)"|import { \1 } from "\2.js"|g' "$file"
  sed -i "s|import { \(.*\) } from '\(\..*\)'|import { \1 } from '\2.js'|g" "$file"
  
  # Fix import * statements
  sed -i 's|import \* as \(.*\) from "\(\..*\)"|import * as \1 from "\2.js"|g' "$file"
  sed -i "s|import \* as \(.*\) from '\(\..*\)'|import * as \1 from '\2.js'|g" "$file"
  
  # Handle re-exports
  sed -i 's|export { \(.*\) } from "\(\..*\)"|export { \1 } from "\2.js"|g' "$file"
  sed -i "s|export { \(.*\) } from '\(\..*\)'|export { \1 } from '\2.js'|g" "$file"
  
  # Handle re-exports with renaming
  sed -i 's|export { \(.*\) as \(.*\) } from "\(\..*\)"|export { \1 as \2 } from "\3.js"|g' "$file"
  sed -i "s|export { \(.*\) as \(.*\) } from '\(\..*\)'|export { \1 as \2 } from '\3.js'|g" "$file"
  
  # Fix @shared schema imports
  sed -i 's|import \(.*\) from "@shared/schema"|import \1 from "../shared/schema.js"|g' "$file"
  sed -i "s|import \(.*\) from '@shared/schema'|import \1 from '../shared/schema.js'|g" "$file"
  
  sed -i 's|import { \(.*\) } from "@shared/schema"|import { \1 } from "../shared/schema.js"|g' "$file"
  sed -i "s|import { \(.*\) } from '@shared/schema'|import { \1 } from '../shared/schema.js'|g" "$file"
  
  echo "Fixed imports in $file"
done

echo "All server imports have been fixed with .js extensions!"
