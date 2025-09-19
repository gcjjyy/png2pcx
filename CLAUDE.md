# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PNG to PCX image format converter project that converts PNG files to PCX format using a predefined 256-color palette. The project also includes utilities for palette visualization and generation.

## Core Components

### Main Converter (png2pcx.ts)
- Converts PNG images to PCX format using RLE compression
- Uses a 768-byte palette file (256 colors × 3 bytes RGB)
- Automatically finds nearest color match from palette (excluding index 0 for transparency)
- Outputs PCX files with uppercase names in the same directory

### Palette Visualizer (pal2png.ts)
- Converts 768-byte RGB palette files to PNG for visualization
- Default layout: 16×16 grid, customizable via --cols parameter
- Usage: `ts-node pal2png.ts --input palette.pal --output out.png [--cols N]`

### Palette Generator (softmilk32.c)
- C program that generates SOFTMILK.PAL from hardcoded hex color values
- Contains 46 predefined colors for the palette
- Compile: `gcc -o softmilk32 softmilk32.c`
- Run: `./softmilk32` (generates SOFTMILK.PAL)

## Common Commands

```bash
# Install dependencies
npm install

# Convert all PNG files in current directory to PCX
npm start
# or
ts-node png2pcx.ts

# Visualize a palette file
ts-node pal2png.ts --input SOFTMILK.PAL --output palette.png

# Generate palette file (if softmilk32 binary exists)
./softmilk32
```

## Technical Details

### PCX Format Implementation
- PCX header: 128 bytes with image dimensions and encoding info
- RLE (Run-Length Encoding) compression for image data
- 256-color palette appended at end (769 bytes: 0x0C marker + 768 RGB bytes)
- Transparency: Alpha channel ≤ 128 maps to palette index 0

### File Structure
- All PNG source files are in the root directory
- Generated PCX files are saved with uppercase names
- Multiple palette files supported: SOFTMILK.PAL, DMTD.PAL, DP256.PAL

## Dependencies
- TypeScript with ts-node for execution
- pngjs library for PNG manipulation
- Node.js file system APIs for file I/O