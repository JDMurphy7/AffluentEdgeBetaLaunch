#!/bin/bash

# Fix remaining import issues
echo "Fixing remaining imports..."

# Fix analytics imports
sed -i 's|"../services/analytics.js"|"../services/analytics/index.js"|g' /workspaces/AffluentEdgeBetaLaunch/server/routes/analytics.ts
sed -i 's|"../../services/analytics.js"|"../../services/analytics/index.js"|g' /workspaces/AffluentEdgeBetaLaunch/server/routes/v1/analytics.ts

# Fix shared/schema imports
sed -i 's|"@shared/schema"|"../shared/schema.js"|g' /workspaces/AffluentEdgeBetaLaunch/server/storage.ts
sed -i 's|"../shared/schema"|"../../shared/schema.js"|g' /workspaces/AffluentEdgeBetaLaunch/server/services/openai.ts

# Fix vite.config.pathalias import
sed -i 's|"./vite.config.pathalias"|"./vite.config.pathalias.js"|g' /workspaces/AffluentEdgeBetaLaunch/vite.config.ts

echo "Fixed remaining imports!"
