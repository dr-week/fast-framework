import cv2
import numpy as np
import os

img = cv2.imread('C:/Users/disha/.gemini/antigravity/brain/354c538c-2513-406c-9058-36d44b7bc02c/.user_uploaded/media_1792217248274_c675cd98.png')
# Bounding box of circular logo
crop = img[130:378, 188:440]
gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)

# Otsu thresholding for perfect separation of white pattern
_, thresh = cv2.threshold(gray, 65, 255, cv2.THRESH_BINARY)

# Find all contours
contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

h, w = thresh.shape
svg_paths = []

for cnt in contours:
    if cv2.contourArea(cnt) < 15:
        continue
    epsilon = 0.5
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    points = approx.reshape(-1, 2)
    if len(points) < 3:
        continue
    d = 'M ' + ' L '.join(f'{pt[0]} {pt[1]}' for pt in points) + ' Z'
    svg_paths.append(d)

path_data = ' '.join(svg_paths)

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor">
  <!-- Zuari Tidal Crest Logo - Danger.Labs -->
  <path fill-rule="evenodd" d="{path_data}" />
</svg>'''

os.makedirs('packages/recipes/styles', exist_ok=True)
os.makedirs('playground/public', exist_ok=True)
os.makedirs('packages/glyphs/src', exist_ok=True)

with open('packages/recipes/styles/zuari-logo.svg', 'w') as f:
    f.write(svg_content)

with open('playground/public/zuari-logo.svg', 'w') as f:
    f.write(svg_content)

print(f"Generated SVG logo with {len(svg_paths)} paths, width: {w}, height: {h}")
