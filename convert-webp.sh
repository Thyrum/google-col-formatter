find docs/assets/img -type f -name "*.png" -exec sh -c 'for file; do cwebp "$file" -o "${file}.webp"; done' sh {} +
