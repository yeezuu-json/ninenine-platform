#!/bin/bash

# Fix shadcn imports to use @/lib/utils instead of physical paths
find packages/frontend/ui/src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/from "packages\/lib\/utils"/from "@\/lib\/utils"/g' {} \;

echo "✅ Fixed shadcn imports"
