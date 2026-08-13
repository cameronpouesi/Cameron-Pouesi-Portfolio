#!/bin/bash
# Brings newly dropped masters into the site.
#
# Encoding standard for /video/clips — the file the lightbox plays:
#   fits inside 1280x1280 (so portrait pieces keep their shape),
#   CRF 20, which is visually close to transparent for this material,
#   128k audio. Roughly 4-6x the bitrate of the old batch.
#
# The earlier batch was encoded at CRF 30 / 960px and their masters were
# deleted, so those cannot be improved without re-supplying the sources.
# Don't repeat that: keep masters somewhere outside public/.
set -e
FFMPEG="/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
IN="public/video/previews"
CLIPS="public/video/clips"

declare -A MAP=(
  ["Reality TV_Ready Gamer Mum - Video Preview.mp4"]="ready-gamer-mum.mp4"
  ["Advertising_AON x Surf Lifesaving NZ - Corner Store - Video Preview.mp4"]="aon-x-surf-life-saving.mp4"
  ["Advertising_Coach Mate NZRL - Corner Store - Video Preview.mp4"]="coachmate-app.mp4"
  ["Advertising_Auckland Airport Socials c- Corner Store - Video Preview.mp4"]="auckland-airport.mp4"
  ["Advertising_Hyoketsu Promo - Corner Store - Video Preview.mp4"]="hyoketsu.mp4"
  ["Freelance_Unspoken Manu Vatuvei.mp4"]="unspoken-manu-vatuvei.mp4"
  ["Freelance_Lime After Lime - Cyndi Lauper Parody (Time After Time).mp4"]="lime-after-lime.mp4"
  ["Freelance_Tiki Taane - Saviour _ Summer _ Get Up (Live at Leigh Sawmill).mp4"]="tiki-taane-live.mp4"
)

for src in "${!MAP[@]}"; do
  dest="${MAP[$src]}"
  [ -f "$IN/$src" ] || { echo "SKIP (missing): $src"; continue; }
  echo "=== $dest ==="
  "$FFMPEG" -y -loglevel error -i "$IN/$src" \
    -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2" \
    -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$CLIPS/$dest"
  rm "$IN/$src"
done

echo "=== DONE ==="
ls -la --block-size=K "$CLIPS" | awk '{print $5, $9}'
