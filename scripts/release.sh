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

# 3. Version bump (consume changesets → update versions + CHANGELOG)
echo ""
echo -e "${YELLOW}▸ Updating versions...${NC}"
pnpm changeset version
echo -e "${GREEN}✔ Versions updated${NC}"

# 4. Install dependencies (lockfile may change after version bump)
echo ""
echo -e "${YELLOW}▸ Installing dependencies...${NC}"
pnpm install --no-frozen-lockfile
echo -e "${GREEN}✔ Dependencies installed${NC}"

# 5. Commit version bump
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo -e "${YELLOW}▸ Committing version changes...${NC}"
  git add .
  git commit -m "chore: release packages"
  echo -e "${GREEN}✔ Version changes committed${NC}"
fi

# 6. Build all packages
echo ""
echo -e "${YELLOW}▸ Building all packages...${NC}"
pnpm build
echo -e "${GREEN}✔ Build complete${NC}"

# 7. Publish
echo ""
echo -e "${YELLOW}▸ Publishing packages...${NC}"
pnpm changeset publish

echo ""
echo -e "${GREEN}✔ All packages published successfully!${NC}"
echo ""

# 8. Push commits and tags
echo -e "${YELLOW}▸ Pushing to remote...${NC}"
git push --follow-tags
echo -e "${GREEN}✔ Pushed${NC}"

echo ""
echo -e "${GREEN}🎉 Release complete!${NC}"
