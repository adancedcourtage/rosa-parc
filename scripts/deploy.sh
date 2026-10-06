#!/bin/sh
# Publie le site sur GitHub Pages : construit dist/ puis le pousse sur la branche gh-pages
# du dépôt « origin ». Usage : npm run deploy
set -e
cd "$(dirname "$0")/.."

REMOTE=$(git remote get-url origin)
NAME=$(git config user.name)
EMAIL=$(git config user.email)
npm run build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "Déploiement $(date '+%Y-%m-%d %H:%M')"
git push -f "$REMOTE" gh-pages
rm -rf .git
echo "Site publié sur la branche gh-pages de $REMOTE"
