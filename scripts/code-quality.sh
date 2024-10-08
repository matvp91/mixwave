set -e 
set -o pipefail

echo "$1 on packages/$2"

if [ "$1" == "eslint" ]; then
  eslint "packages/$2/src/**/*.ts"
  echo "✅ eslint"
fi
if [ "$1" == "prettier-check" ]; then
  prettier --check "packages/$2/src/**/*.ts"
  echo "✅ prettier"
fi