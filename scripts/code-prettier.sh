set -e
echo "Run prettier compliance on packages/$1"
prettier --check "packages/$1/src/**/*.ts"
echo "✅ prettier"
