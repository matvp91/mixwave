#!/usr/bin/env bash
set -euo pipefail

platform=$(uname -ms)

# Reset
Color_Off=''

# Regular Colors
Green=''
Red=''
Dim='' # White

if [[ -t 1 ]]; then
    # Reset
    Color_Off='\033[0m' # Text Reset

    # Regular Colors
    Red='\033[0;31m'   # Red
    Green='\033[0;32m' # Green
    Dim='\033[0;2m'    # White
fi

info() {
    echo -e "${Dim}$@ ${Color_Off}"
}

success() {
    echo -e "${Green}$@ ${Color_Off}"
}

error() {
    echo -e "${Red}error${Color_Off}:" "$@" >&2
    exit 1
}

command -v unzip >/dev/null ||
    error 'unzip is required to install artisan'

case $platform in
'Darwin arm64')
    target=darwin-arm64
    ;;
'Linux arm64' | 'Linux aarch64')
    target=linux-arm64
    ;;
esac

current_dir=$(pwd)

artisan_uri=https://cdn.mixwave.stream/bin/artisan-$target.zip

install_env=ARTISAN_INSTALL
install_dir=${!install_env:-$HOME/.artisan}
zip=artisan.zip

if [[ ! -d $install_dir ]]; then
    mkdir -p "$install_dir" ||
        error "Failed to create install directory \"$install_dir\""
fi

curl --fail --location --progress-bar --output "$install_dir/$zip" "$artisan_uri" ||
    error "Failed to download mixwave from \"$artisan_uri\""

unzip -oqd "$current_dir" "$install_dir/$zip" ||
    error 'Failed to extract artisan'

rm -r "$install_dir/$zip"

success "Installed succesfully"

info "You can find the binary at .$current_dir/artisan"

echo "Run ./artisan to get started"