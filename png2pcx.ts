import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

// Read palette file (DMTD.PAL)
function readPalette(palPath: string): number[][] {
    const buf = fs.readFileSync(palPath);
    if (buf.length !== 768) {
        throw new Error('Palette file must be 768 bytes (256 colors * 3 bytes)');
    }
    const palette: number[][] = [];
    for (let i = 0; i < 256; i++) {
        palette.push([buf[i * 3], buf[i * 3 + 1], buf[i * 3 + 2]]);
    }
    return palette;
}

// Find nearest palette index (excluding index 0)
function findNearestColorIndex(r: number, g: number, b: number, palette: number[][]): number {
    let minDist = Infinity;
    let minIdx = 1;
    for (let i = 1; i < palette.length; i++) {
        const [pr, pg, pb] = palette[i];
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dist < minDist) {
            minDist = dist;
            minIdx = i;
        }
    }
    return minIdx;
}

// PCX header
function createPCXHeader(width: number, height: number): Buffer {
    const header = Buffer.alloc(128, 0);
    header[0] = 0x0A; // Manufacturer
    header[1] = 0x05; // Version
    header[2] = 0x01; // Encoding
    header[3] = 0x08; // Bits per pixel
    header.writeUInt16LE(0, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(width - 1, 8);
    header.writeUInt16LE(height - 1, 10);
    header.writeUInt16LE(width, 12);
    header.writeUInt16LE(height, 14);
    header[64] = 0;
    header[65] = 1;
    header.writeUInt16LE(width, 66);
    header.writeUInt16LE(1, 68);
    return header;
}

// PCX RLE
function pcxRLEEncode(data: Buffer): Buffer {
    const out: number[] = [];
    let i = 0;
    while (i < data.length) {
        let count = 1;
        while (i + count < data.length && data[i] === data[i + count] && count < 63) {
            count++;
        }
        if (count > 1 || (data[i] & 0xC0) === 0xC0) {
            out.push(0xC0 | count, data[i]);
            i += count;
        } else {
            out.push(data[i]);
            i++;
        }
    }
    return Buffer.from(out);
}

// Convert PNG → PCX
async function pngToPcx(pngPath: string, palette: number[][]) {
    const pngData = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngData);
    const { width, height, data } = png;
    const bytesPerLine = Math.ceil(width / 2) * 2;
    const imageData = Buffer.alloc(height * bytesPerLine, 0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            imageData[y * bytesPerLine + x] = (a <= 128) ? 0 : findNearestColorIndex(r, g, b, palette);
        }
    }

    const rleData: Buffer[] = [];
    for (let y = 0; y < height; y++) {
        const line = imageData.slice(y * bytesPerLine, (y + 1) * bytesPerLine);
        rleData.push(pcxRLEEncode(line));
    }
    const rleImage = Buffer.concat(rleData);

    const pcxPalette = Buffer.alloc(769);
    pcxPalette[0] = 0x0C;
    for (let i = 0; i < 256; i++) {
        pcxPalette[1 + i * 3] = palette[i][0];
        pcxPalette[1 + i * 3 + 1] = palette[i][1];
        pcxPalette[1 + i * 3 + 2] = palette[i][2];
    }

    const header = createPCXHeader(width, height);
    const pcxBuf = Buffer.concat([header, rleImage, pcxPalette]);

    const outPath = path.join(path.dirname(pngPath), path.basename(pngPath, '.png').toUpperCase() + '.PCX');
    fs.writeFileSync(outPath, pcxBuf);
    console.log(`✔ PCX saved: ${outPath}`);
}

// === Main ===
(async () => {
    const dir = process.cwd();
    const palPath = path.join(dir, 'DMTD.PAL');
    if (!fs.existsSync(palPath)) {
        console.error('❌ Palette file "DMTD.PAL" not found in current directory.');
        process.exit(1);
    }
    const palette = readPalette(palPath);

    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.png'));
    if (files.length === 0) {
        console.log('No PNG files found in current directory.');
        return;
    }

    console.log(`Found ${files.length} PNG files. Converting...`);
    for (const file of files) {
        const filePath = path.join(dir, file);
        await pngToPcx(filePath, palette);
    }
    console.log('✅ All files converted successfully.');
})();

