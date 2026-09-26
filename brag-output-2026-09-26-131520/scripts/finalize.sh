#!/bin/sh
set -eu
OUT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ffmpeg -y -ss 159 -i "$OUT/brag.mp4" -frames:v 1 -q:v 2 "$OUT/brag.jpg"
ffmpeg -y -i "$OUT/brag.mp4" -i "$OUT/brag.jpg" -filter_complex_threads 1 -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map '[v]' -map '0:a?' -c:v h264_videotoolbox -b:v 8M -allow_sw 0 -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT/brag.poster.mp4"
mv "$OUT/brag.mp4" "$OUT/rendered-original.mp4"
mv "$OUT/brag.poster.mp4" "$OUT/brag.mp4"
