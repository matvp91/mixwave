rm -rf ./dist
mkdir ./dist

bun build --compile --minify --sourcemap --target=bun-darwin-arm64 ./src/index.ts --outfile ./.compile/darwin-arm64/artisan
(cd ./.compile/darwin-arm64 && zip -r -X "../../dist/artisan-darwin-arm64.zip" .)

bun build --compile --minify --sourcemap --target=bun-linux-arm64 ./src/index.ts --outfile ./.compile/linux-arm64/artisan
(cd ./.compile/linux-arm64 && zip -r -X "../../dist/artisan-linux-arm64.zip" .)

rm -rf ./.compile

cp ./scripts/install.sh ./dist
mv ./dist/install.sh ./dist/artisan-install.sh