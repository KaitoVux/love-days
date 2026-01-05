#!/usr/bin/env python3
"""
Generate a beautiful album cover placeholder with rose pink gradient theme
"""
from PIL import Image, ImageDraw
import math

# Create 800x800 image
size = 800
img = Image.new('RGB', (size, size))
draw = ImageDraw.Draw(img)

# Rose pink gradient (HSL 350 hue) - from dark to light
# HSL(350, 30%, 8%) to HSL(350, 80%, 65%)
gradient_colors = [
    (31, 14, 18),      # Dark rose (bottom)
    (51, 19, 26),
    (77, 26, 36),
    (102, 34, 47),
    (128, 41, 57),
    (153, 49, 68),
    (179, 57, 78),
    (204, 64, 89),
    (230, 72, 99),     # Light rose (top)
]

# Draw vertical gradient
for y in range(size):
    # Calculate color for this row
    color_idx = int((y / size) * (len(gradient_colors) - 1))
    next_idx = min(color_idx + 1, len(gradient_colors) - 1)
    blend = ((y / size) * (len(gradient_colors) - 1)) - color_idx

    r = int(gradient_colors[color_idx][0] * (1 - blend) + gradient_colors[next_idx][0] * blend)
    g = int(gradient_colors[color_idx][1] * (1 - blend) + gradient_colors[next_idx][1] * blend)
    b = int(gradient_colors[color_idx][2] * (1 - blend) + gradient_colors[next_idx][2] * blend)

    draw.line([(0, y), (size, y)], fill=(r, g, b))

# Add subtle radial overlay for depth
overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)

center = size // 2
max_radius = size // 2

for radius in range(max_radius, 0, -5):
    alpha = int((1 - (radius / max_radius)) * 40)  # Subtle vignette
    overlay_draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=(0, 0, 0, alpha)
    )

img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
draw = ImageDraw.Draw(img)

# Draw subtle musical notes
note_color = (200, 160, 170)

# Function to draw a music note
def draw_note(x, y, size_mult=1.0):
    s = int(30 * size_mult)
    # Note head (oval)
    draw.ellipse([x, y, x + s, y + int(s * 0.6)], outline=note_color, width=2)
    # Note stem
    draw.line([x + s, y + int(s * 0.3), x + s, y - int(s * 1.2)], fill=note_color, width=2)

# Draw floating notes at various positions
notes_positions = [
    (150, 200, 0.8),
    (600, 250, 1.0),
    (250, 550, 0.7),
    (650, 600, 0.9),
    (400, 150, 0.6),
    (500, 650, 0.8),
]

for x, y, size_mult in notes_positions:
    draw_note(x, y, size_mult)

# Draw vinyl record silhouette in center
vinyl_center = (size // 2, size // 2)
vinyl_radius = 180

# Outer circle
draw.ellipse(
    [vinyl_center[0] - vinyl_radius, vinyl_center[1] - vinyl_radius,
     vinyl_center[0] + vinyl_radius, vinyl_center[1] + vinyl_radius],
    outline=(255, 255, 255),
    width=3
)

# Inner circles (grooves)
for r in [150, 120, 90]:
    draw.ellipse(
        [vinyl_center[0] - r, vinyl_center[1] - r,
         vinyl_center[0] + r, vinyl_center[1] + r],
        outline=(200, 180, 190),
        width=1
    )

# Center hole
center_radius = 25
draw.ellipse(
    [vinyl_center[0] - center_radius, vinyl_center[1] - center_radius,
     vinyl_center[0] + center_radius, vinyl_center[1] + center_radius],
    fill=(40, 20, 25),
    outline=(255, 255, 255),
    width=2
)

# Add subtle sparkle effects
sparkles = [
    (200, 100), (700, 180), (150, 650), (680, 700),
    (300, 350), (550, 450), (400, 600)
]

for sx, sy in sparkles:
    # Small cross sparkle
    draw.line([sx - 8, sy, sx + 8, sy], fill=(255, 220, 230), width=2)
    draw.line([sx, sy - 8, sx, sy + 8], fill=(255, 220, 230), width=2)

# Save the image
output_path = '/Users/kaitovu/Desktop/Projects/love-days/apps/web/public/images/default-album.png'
img.save(output_path, 'PNG', quality=95)
print(f"✓ Generated placeholder: {output_path}")
print(f"  Size: {size}x{size}px")
print(f"  Theme: Rose pink gradient (HSL 350 hue)")
print(f"  Elements: Vinyl record, musical notes, sparkles")
