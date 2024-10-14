#!/usr/bin/env bash
set -euo pipefail

platform=$(uname -ms)

Color_Off=''
Red=''
Green=''
Dim=''

if [[ -t 1 ]]; then
    Color_Off='\033[0m' # Off
    Red='\033[0;31m'    # Red
    Green='\033[0;32m'  # Green
    Dim='\033[0;2m'     # White
fi

error() {
    echo -e "${Red}error${Color_Off}:" "$@" >&2
    exit 1
}

info() {
    echo -e "${Dim}$@ ${Color_Off}"
}

success() {
    echo -e "${Green}$@ ${Color_Off}"
}

case $platform in
'Darwin x86_64')
    target=darwin-x64
    ;;
'Darwin arm64')
    target=darwin-arm64
    ;;
'Linux arm64' | 'Linux aarch64')
    target=linux-arm64
    ;;
'Linux x86_64' | *)
    target=linux-x64
    ;;
esac

info "Detected target: $target"

bin_dir=$(pwd)/bin

echo "Bins will be saved in \"$bin_dir\""

if [ -d "$bin_dir" ]; then 
    rm -Rf $bin_dir;
fi

mkdir $bin_dir

install_ffmpeg () {
    ffmpeg_uri=https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-$target.gz

    info "Downloading ffmpeg from \"$ffmpeg_uri\""

    ffmpeg_exe=$bin_dir/ffmpeg.gz
    curl --fail --location --progress-bar --output "$ffmpeg_exe" "$ffmpeg_uri" ||
        error "Failed to download ffmpeg from \"$ffmpeg_uri\""

    gzip -d $ffmpeg_exe

    success "Downloaded ffmpeg"
}

install_packager () {
    packager_target=$target
    if [ "$packager_target" == "darwin-x64" ]; then
        packager_target=osx-x64
    elif [ "$packager_target" == "darwin-arm64" ]; then
        packager_target=osx-arm64
    fi

    packager_uri=https://github.com/shaka-project/shaka-packager/releases/download/v3.2.0/packager-$packager_target

    info "Downloading packager from \"$packager_uri\""

    packager_exe=$bin_dir/packager
    curl --fail --location --progress-bar --output "$packager_exe" "$packager_uri" ||
        error "Failed to download packager from \"$packager_uri\""

    success "Downloaded packager"
}

install_ffmpeg
install_packager

chmod +x $bin_dir/ffmpeg
chmod +x $bin_dir/packager

info "Added exec permissions"

echo "🎉 Bins installed, you're all set!"