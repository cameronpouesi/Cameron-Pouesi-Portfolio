#!/bin/bash
# Encodes the masters in "Media Masters/" into the web clips the site serves.
#
# The masters are the source of truth and are never written to or removed.
# Keep them out of public/ so they're never deployed.
#
# Clips (what the lightbox plays): fit inside 1280, CRF 21, preset slow.
# CRF 21 is a deliberate step up from the CRF 30 the first batch got —
# that batch is what looked blocky. The bitrate ceiling only clips peaks
# on the busiest footage so one long piece can't run away with 100MB.
#
# The hero is a silent background loop behind type, so it gets no audio
# track at all and a slightly softer CRF; nobody studies it.
set -e
FFMPEG="/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
SRC="Media Masters"
CLIPS="public/video/clips"
FIT="scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"

declare -A MAP=(
  ["Reality TV_Celebrity Treasure Island Preview.mp4"]="celebrity-treasure-island"
  ["Reality TV_The Bachelorette Preview.mp4"]="the-bachelorette"
  ["Reality TV_The Traitors Australia.mp4"]="the-traitors-australia"
  ["Reality TV_The Traitors NZ Season 2 Preview.mp4"]="the-traitors-nz-season-2"
  ["Reality TV_The Traitors NZ Season 3.mp4"]="the-traitors-nz-season-3"
  ["Reality TV_Rupauls Dragrace Downunder Preview.mp4"]="rupauls-dragrace-downunder"
  ["Reality TV_Glow Up NZ Preview.mp4"]="glow-up-nz"
  ["Reality TV_Ready Gamer Mum - Video Preview.mp4"]="ready-gamer-mum"
  ["Reailty TV_Match Fit Preview.mp4"]="match-fit"
  ["Documentary_Forever Auckland FC Preview.mp4"]="auckland-fc"
  ["Documentary_Triple Threat Preview.mp4"]="triple-threat"
  ["Documentary_Game On.mp4"]="game-on"
  ["Documentary_Homes in the Wild.mp4"]="george-clarke-homes-in-the-wild"
  ["Documentary_Māori All Blacks Bound By Blood v2.mp4"]="maori-all-blacks-bound-by-blood"
  # v2 replaced the original, which was one of the CRF 30 / 960px batch
  # this script exists to get away from.
  ["Documentary_Sneakerholics v2.mp4"]="sneakerholics"
  ["Comedy_Taskmaster Australia Video Preview.mp4"]="taskmaster-australia"
  ["Childrens TV_Sticky TV - Pickled Possum Productions.mp4"]="sticky-tv"
  ["Advertising_AON x Surf Lifesaving NZ - Corner Store - Video Preview.mp4"]="aon-x-surf-life-saving"
  ["Advertising_Coach Mate NZRL - Corner Store - Video Preview.mp4"]="coachmate-app"
  ["Advertising_Auckland Airport Socials c- Corner Store - Video Preview.mp4"]="auckland-airport"
  ["Advertising_Hyoketsu Promo - Corner Store - Video Preview.mp4"]="hyoketsu"
  ["Freelance_UNSPOKEN Manu Vatuvei preview v2.mp4"]="unspoken-manu-vatuvei"
  ["Freelance_Bramble x First The Dark and Stormy.mp4"]="bramble-dark-and-stormy"
  ["Freelance_Bramble x First The Last Word.mp4"]="bramble-last-word"
  ["Freelance_Tiki Taane - Saviour _ Summer _ Get Up (Live at Leigh Sawmill) V2.mp4"]="tiki-taane-live"
  ["Freelance_Lime After Lime - Cyndi Lauper Parody (Time After Time).mp4"]="lime-after-lime"
  ["Freelance_Having a co-worker that eats too loudly - Chips - Viva La Dirt League.mp4"]="vldl-chips"
  ["Freelance_Looting random chests in games - Chest - Viva La Dirt League.mp4"]="vldl-chest"
  ["Freelance_When an NPC is aggro during a cut scene - Viva La Dirt League.mp4"]="vldl-provoked"
  ["Freelance_When game choices make no difference - Choice - Viva La Dirt League.mp4"]="vldl-choice"
  ["Freelance_When mugging gets stupid - Wagon - Viva La Dirt League.mp4"]="vldl-wagon"
)

for src in "${!MAP[@]}"; do
  slug="${MAP[$src]}"
  [ -f "$SRC/$src" ] || { echo "SKIP (missing master): $src"; continue; }
  echo "=== $slug ==="
  "$FFMPEG" -y -loglevel error -i "$SRC/$src" \
    -vf "$FIT" -c:v libx264 -preset slow -crf 21 -maxrate 3500k -bufsize 7000k \
    -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
    "$CLIPS/$slug.mp4"
done

# --- hero ------------------------------------------------------------------
HERO="$SRC/Cameron Pouesi Editor Showcase v2.mp4"
if [ -f "$HERO" ]; then
  echo "=== hero ==="
  "$FFMPEG" -y -loglevel error -i "$HERO" \
    -vf "scale='min(1600,iw)':-2" -c:v libx264 -preset slow -crf 23 \
    -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -an -movflags +faststart \
    public/video/reel-bg.mp4
fi

echo "=== DONE ==="
du -sh "$CLIPS"
