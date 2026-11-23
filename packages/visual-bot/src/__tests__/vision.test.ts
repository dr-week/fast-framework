import { describe, expect, it } from 'vitest';
import {
  computeSobelEdges,
  imageToGrayscale,
  matchEdgeTemplate,
  matchMultiScaleEdge,
  registerIconTemplate,
  resizeEdgeMap,
  rgbaToGrayscale,
  synthesizeIconEdgeMap,
  VISUAL_ICON_CATALOG,
} from '../vision/index.js';

function renderIconScene(
  sceneW: number,
  sceneH: number,
  iconX: number,
  iconY: number,
  iconSize: number,
  darkTheme: boolean
) {
  const data = new Uint8ClampedArray(sceneW * sceneH * 4);
  const bg = darkTheme ? 18 : 242;
  const fg = darkTheme ? 235 : 22;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg;
    data[i + 1] = bg;
    data[i + 2] = bg;
    data[i + 3] = 255;
  }
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const nx = x / iconSize;
      const ny = y / iconSize;
      if (nx >= 0.2 && nx <= 0.8 && ny >= 0.2 && ny <= 0.8) {
        const px = iconX + x;
        const py = iconY + y;
        if (px >= 0 && px < sceneW && py >= 0 && py < sceneH) {
          const idx = (py * sceneW + px) * 4;
          data[idx] = fg;
          data[idx + 1] = fg;
          data[idx + 2] = fg;
          data[idx + 3] = 255;
        }
      }
    }
  }
  return { data, width: sceneW, height: sceneH };
}

describe('@zuari/visual-bot/vision', () => {
  it('locates odd-pixel icon identically in dark and light themes via Sobel + 2D NCC', () => {
    const tmplImg = renderIconScene(16, 16, 0, 0, 16, true);
    const tmplEdges = computeSobelEdges(imageToGrayscale(tmplImg), 16, 16);

    const darkScene = renderIconScene(64, 64, 17, 19, 16, true);
    const lightScene = renderIconScene(64, 64, 17, 19, 16, false);

    const darkMatch = matchEdgeTemplate(
      computeSobelEdges(imageToGrayscale(darkScene), 64, 64),
      64,
      64,
      tmplEdges,
      16,
      16
    );
    const lightMatch = matchEdgeTemplate(
      computeSobelEdges(imageToGrayscale(lightScene), 64, 64),
      64,
      64,
      tmplEdges,
      16,
      16
    );

    expect(darkMatch.found).toBe(true);
    expect(lightMatch.found).toBe(true);
    expect(darkMatch.confidence).toBeGreaterThanOrEqual(0.98);
    expect(lightMatch.confidence).toBeGreaterThanOrEqual(0.98);
    expect(darkMatch.box).toEqual({ x: 17, y: 19, width: 16, height: 16 });
    expect(lightMatch.box).toEqual({ x: 17, y: 19, width: 16, height: 16 });
  });

  it('locates 1.25x scaled icon via multi-scale pyramid matching', () => {
    const baseTmpl = renderIconScene(16, 16, 0, 0, 16, true);
    const tmplEdges = computeSobelEdges(rgbaToGrayscale(baseTmpl.data, 16, 16), 16, 16);

    const scaledScene = renderIconScene(72, 72, 21, 23, 20, false);
    const sceneEdges = computeSobelEdges(rgbaToGrayscale(scaledScene.data, 72, 72), 72, 72);

    const resized = resizeEdgeMap(tmplEdges, 16, 16, 20, 20);
    expect(resized.length).toBe(400);

    const multiRes = matchMultiScaleEdge(sceneEdges, 72, 72, tmplEdges, 16, 16, {
      scales: [0.8, 1.0, 1.25],
      threshold: 0.5,
    });
    expect(multiRes.found).toBe(true);
    expect(multiRes.scale).toBe(1.25);
    expect(multiRes.durationMs).toBeLessThan(150);
  });

  it('synthesizes built-in and custom registered icon edge maps', () => {
    const heart = synthesizeIconEdgeMap('heart', 24, 24);
    expect(heart.some((v) => v > 0)).toBe(true);

    registerIconTemplate(
      'custom_dot',
      { width: 8, height: 8, description: 'Center dot', category: 'test' },
      (w, h) => {
        const out = new Float32Array(w * h);
        out[Math.floor(h / 2) * w + Math.floor(w / 2)] = 1;
        return out;
      }
    );
    expect(VISUAL_ICON_CATALOG.custom_dot.category).toBe('test');
    const dot = synthesizeIconEdgeMap('custom_dot', 8, 8);
    expect(dot[4 * 8 + 4]).toBe(1);
  });
});
