#!/bin/sh
# Build 4:3 case-study stills from the real project assets.
# crop: fill the frame, centre or given gravity.  fit: whole image on a dark plate.
set -e
cd "$(dirname "$0")/.."
S=assets/images
P=$S/projects
Q=82

crop() { # src out w h gravity
  magick "$1" -auto-orient -resize "$3x$4^" -gravity "$5" -extent "$3x$4" -strip -interlace Plane -quality $Q "$2"
}
fit() { # src out w h
  magick "$1" -auto-orient -resize "$3x$4" -background '#0b0b0b' -gravity center -extent "$3x$4" -strip -interlace Plane -quality $Q "$2"
}

# Forget Me Not
crop $P/forget-me-not/04.png $P/forget-me-not/hero.jpg    1200 900 center
crop $P/forget-me-not/02.png $P/forget-me-not/process.jpg  900 675 center
crop $P/forget-me-not/05.png $P/forget-me-not/detail.jpg   900 675 center
fit  $P/forget-me-not/01.jpg $P/forget-me-not/press.jpg    900 675

# Triqueta
crop $S/triqueta.jpg $P/triqueta/hero.jpg   1200 900 center
crop $S/triqueta.jpg $P/triqueta/process.jpg 900 675 northwest
crop $S/triqueta.jpg $P/triqueta/detail.jpg  900 675 southeast

# River Pierce
fit  $S/river-pierce-teaching-hands.png $P/river-pierce/hero.jpg    1200 900
crop $S/river-pierce-teaching-hands.png $P/river-pierce/process.jpg  900 675 north
crop $S/river-pierce-teaching-hands.png $P/river-pierce/detail.jpg   900 675 south

# Motion
crop $S/motion.png $P/motion/hero.jpg    1200 900 center
crop $S/motion.png $P/motion/process.jpg  900 675 northwest
crop $S/motion.png $P/motion/detail.jpg   900 675 southeast

# 9ine5ive6eis
crop $P/9ine5ive6eis/01.jpg $P/9ine5ive6eis/hero.jpg    1200 900 center
crop $P/9ine5ive6eis/04.png $P/9ine5ive6eis/process.jpg  900 675 center
crop $P/9ine5ive6eis/06.png $P/9ine5ive6eis/detail.jpg   900 675 center
crop $P/9ine5ive6eis/03.jpg $P/9ine5ive6eis/extra.jpg    900 675 center

# Tigers Blood
fit  $P/tigers-blood/01.jpg $P/tigers-blood/hero.jpg    1200 900
crop $P/tigers-blood/02.jpg $P/tigers-blood/process.jpg  900 675 center
crop $P/tigers-blood/02.jpg $P/tigers-blood/detail.jpg   900 675 southeast

# Archived works
crop $S/archived.jpg $P/archived/hero.jpg    1200 900 center
crop $S/archived.jpg $P/archived/process.jpg  900 675 west
crop $S/archived.jpg $P/archived/detail.jpg   900 675 east

echo "--- sizes ---"
ls -l $P/*/hero.jpg $P/*/process.jpg $P/*/detail.jpg $P/forget-me-not/press.jpg $P/9ine5ive6eis/extra.jpg | awk '{printf "%6.1f KB  %s\n", $5/1024, $9}'
