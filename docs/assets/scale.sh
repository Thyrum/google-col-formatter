#!/bin/sh

[ -z "$1" ] && echo "Usage: $0 <file>" && exit 1

# Get the file's dimensions
#DIMENSIONS=$(identify -format "%wx%h" "$1")

mkdir -p "${1%.*}"

# List the desired dimensions
DESIRED_DIMENSIONS="32x32 48x48 96x96 120x120 128x128"

# Scale the image to the desired dimensions
for DIMENSION in $DESIRED_DIMENSIONS; do
	convert "$1" -resize $DIMENSION "${1%.*}/${1%.*}_${DIMENSION}.${1##*.}"
done
