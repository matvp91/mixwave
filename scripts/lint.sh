echo "🎯 Running lint for packages/$1"

eslint "packages/$1/src/**/*.ts"
echo "✅ eslint"

prettier --check "packages/$1/src/**/*.ts"
echo "✅ prettier"