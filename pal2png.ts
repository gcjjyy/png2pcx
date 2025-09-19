#!/usr/bin/env ts-node

/**
 * palette2png.ts
 *
 * Read a 768-byte RGB palette (256 colors × 3 bytes) and write a PNG where
 * each color is rendered as a single pixel. Default layout is 16×16.
 *
 * Usage:
 *   ts-node palette2png.ts --input palette.bin --output out.png
 *   ts-node palette2png.ts -i palette.pal -o out.png --cols 32   // 32×8 레이아웃
 *   ts-node palette2png.ts -i palette.pal -o out.png --cols 256  // 256×1 스트립
 */

import { readFileSync } from "fs";
import { writeFileSync } from "fs";
import { PNG } from "pngjs";

// Simple CLI parsing (no extra deps)
type Args = {
  input: string;
  output: string;
  cols?: number;
};

function parseArgs(argv: string[]): Args {
  const out: any = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-i" || a === "--input") out.input = argv[++i];
    else if (a === "-o" || a === "--output") out.output = argv[++i];
    else if (a === "--cols") out.cols = parseInt(argv[++i], 10);
    else {
      // allow --key=value
      const m = a.match(/^--(\w+)=([\s\S]+)$/);
      if (m) {
        const [, k, v] = m;
        if (k === "input") out.input = v;
        else if (k === "output") out.output = v;
        else if (k === "cols") out.cols = parseInt(v, 10);
      } else {
        throw new Error(`Unknown arg: ${a}`);
      }
    }
  }
  if (!out.input || !out.output) {
    throw new Error(
      "Usage: ts-node palette2png.ts --input <palette.bin> --output <out.png> [--cols <n>]"
    );
  }
  if (out.cols !== undefined && (!Number.isFinite(out.cols) || out.cols <= 0)) {
    throw new Error("--cols must be a positive integer");
  }
  return out as Args;
}

function main() {
  const { input, output, cols } = parseArgs(process.argv);

  const buf = readFileSync(input);
  if (buf.length < 768) {
    throw new Error(
      `Palette file too small: ${buf.length} bytes. Expected exactly 768 bytes (256×RGB).`
    );
  }
  // If larger than 768, use the first 768 bytes and warn.
  if (buf.length > 768) {
    console.warn(
      `Warning: palette file is ${buf.length} bytes; using first 768 bytes only.`
    );
  }
  const pal = buf.subarray(0, 768);

  const numColors = 256;
  const columns = cols ?? 16; // default 16×16
  const rows = Math.ceil(numColors / columns);

  // Create PNG (no scaling; 1 pixel per color)
  const png = new PNG({ width: columns, height: rows });

  for (let i = 0; i < numColors; i++) {
    const r = pal[i * 3 + 0]!;
    const g = pal[i * 3 + 1]!;
    const b = pal[i * 3 + 2]!;
    const x = i % columns;
    const y = Math.floor(i / columns);
    if (y >= rows) break; // safety

    const idx = (png.width * y + x) << 2; // RGBA
    png.data[idx + 0] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255; // opaque
  }

  const outBuf = PNG.sync.write(png);
  writeFileSync(output, outBuf);
  console.log(`Wrote ${output} (${columns}×${rows})`);
}

if (require.main === module) {
  main();
}

