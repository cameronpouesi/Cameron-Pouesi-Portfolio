#!/bin/bash
# Builds the short loops that play when a screen is hovered.
#
# The files in public/video/clips are the real thing — the lightbox plays
# those. Streaming a 28-minute programme the instant someone's cursor
# crosses a screen is not that. These are 18s and quiet.
#
# Quality matters more than it looks like it should: a preview fills a
# CRT or a grading monitor that the visitor can lean into, so 640/CRF30
# read as mush. 960 inside a square box (portrait pieces keep their
# shape) at CRF 24 is sharp at the sizes these are actually seen.
set -e
FFMPEG="/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
CLIPS="public/video/clips"
OUT="public/video/previews"
mkdir -p "$OUT"

for src in "$CLIPS"/*.mp4; do
  name=$(basename "$src")
  [ -f "$OUT/$name" ] && [ "$OUT/$name" -nt "$src" ] && { echo "have: $name"; continue; }
  echo "=== $name ==="
  # start 8s in so we skip slates and black, take 18s
  "$FFMPEG" -y -loglevel error -ss 8 -t 18 -i "$src" \
    -vf "scale='min(960,iw)':'min(960,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2" \
    -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p \
    -c:a aac -b:a 96k -ac 2 -movflags +faststart "$OUT/$name"
done

echo "=== DONE ==="
du -sh "$OUT"
