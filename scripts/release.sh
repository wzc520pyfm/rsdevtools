#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}⬢ Rspack DevTools Release${NC}"
echo ""

# 1. Check npm login
echo -e "${YELLOW}▸ Checking npm login...${NC}"
NPM_USER=$(npm whoami 2>/dev/null) || {
  echo -e "${RED}✖ Not logged in to npm. Run 'npm login' first.${NC}"
  exit 1
}
echo -e "${GREEN}✔ Logged in as ${NPM_USER}${NC}"

# 2. Check working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}✖ Working directory is not clean. Commit or stash changes first.${NC}"
  exit 1
fi
echo -e "${GREEN}✔ Working directory is clean${NC}"

# 3. Install dependencies
echo ""
echo -e "${YELLOW}▸ Installing dependencies...${NC}"
pnpm install --no-frozen-lockfile
echo -e "${GREEN}✔ Dependencies installed${NC}"

# 4. Build all packages
echo ""
echo -e "${YELLOW}▸ Building all packages...${NC}"
pnpm build
echo -e "${GREEN}✔ Build complete${NC}"

# 5. Publish
echo ""
echo -e "${YELLOW}▸ Publishing packages...${NC}"
pnpm changeset publish

echo ""
echo -e "${GREEN}✔ All packages published successfully!${NC}"
echo ""

# 7. Push git tags
echo -e "${YELLOW}▸ Pushing git tags...${NC}"
git push --follow-tags
echo -e "${GREEN}✔ Tags pushed${NC}"

echo ""
echo -e "${GREEN}🎉 Release complete!${NC}"
