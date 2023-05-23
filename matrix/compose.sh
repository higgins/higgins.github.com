#!/bin/bash

for image_file in "selections"/*.jpg; do
    filename=$(basename "$image_file")
    output_file="withBorder/${filename%.*}.jpg"
    convert -append upper.jpg "$image_file" lower.jpg "$output_file"
    echo "Combined image created: $output_file"
done

echo "Done"
