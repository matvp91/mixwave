set -e
echo "Run eslint on packages/$1"
eslint "packages/$1/src/**/*.ts"
echo "✅ eslint"