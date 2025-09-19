import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

function readPCXHeader(buf: Buffer): {
    width: number;
    height: number;
    bytesPerLine: number;
} {
    const xMin = buf.readUInt16LE(4);
    const yMin = buf.readUInt16LE(6);
    const xMax = buf.readUInt16LE(8);
    const yMax = buf.readUInt16LE(10);
    const bytesPerLine = buf.readUInt16LE(66);

    return {
        width: xMax - xMin + 1,
        height: yMax - yMin + 1,
        bytesPerLine
    };
}

function pcxRLEDecode(data: Buffer, decodedSize: number): Buffer {
    const out = Buffer.alloc(decodedSize);
    let inIdx = 0;
    let outIdx = 0;

    while (inIdx < data.length && outIdx < decodedSize) {
        const byte = data[inIdx++];

        if ((byte & 0xC0) === 0xC0) {
            const count = byte & 0x3F;
            const value = data[inIdx++];
            for (let i = 0; i < count && outIdx < decodedSize; i++) {
                out[outIdx++] = value;
            }
        } else {
            out[outIdx++] = byte;
        }
    }

    return out;
}

function readPCXPalette(buf: Buffer, offset: number): number[][] {
    if (buf[offset] !== 0x0C) {
        throw new Error('Invalid palette marker');
    }

    const palette: number[][] = [];
    for (let i = 0; i < 256; i++) {
        const r = buf[offset + 1 + i * 3];
        const g = buf[offset + 1 + i * 3 + 1];
        const b = buf[offset + 1 + i * 3 + 2];
        palette.push([r, g, b]);
    }

    return palette;
}

async function pcxToPng(pcxPath: string) {
    const pcxData = fs.readFileSync(pcxPath);

    if (pcxData[0] !== 0x0A) {
        throw new Error('Not a valid PCX file');
    }

    const header = readPCXHeader(pcxData);
    const { width, height, bytesPerLine } = header;

    const headerSize = 128;
    const paletteSize = 769;
    const imageDataSize = pcxData.length - headerSize - paletteSize;
    const encodedImageData = pcxData.slice(headerSize, headerSize + imageDataSize);

    const decodedSize = height * bytesPerLine;
    const imageData = pcxRLEDecode(encodedImageData, decodedSize);

    const paletteOffset = pcxData.length - paletteSize;
    const palette = readPCXPalette(pcxData, paletteOffset);

    const png = new PNG({
        width,
        height,
        colorType: 6,
        bitDepth: 8
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const paletteIdx = imageData[y * bytesPerLine + x];
            const pngIdx = (y * width + x) * 4;

            if (paletteIdx === 0) {
                png.data[pngIdx] = 0;
                png.data[pngIdx + 1] = 0;
                png.data[pngIdx + 2] = 0;
                png.data[pngIdx + 3] = 0;
            } else {
                const [r, g, b] = palette[paletteIdx];
                png.data[pngIdx] = r;
                png.data[pngIdx + 1] = g;
                png.data[pngIdx + 2] = b;
                png.data[pngIdx + 3] = 255;
            }
        }
    }

    const outPath = path.join(path.dirname(pcxPath), path.basename(pcxPath, '.PCX').toLowerCase() + '.png');
    const pngBuffer = PNG.sync.write(png);
    fs.writeFileSync(outPath, pngBuffer);
    console.log(`✔ PNG saved: ${outPath}`);
}

(async () => {
    const dir = process.cwd();
    const files = fs.readdirSync(dir).filter(f => f.toUpperCase().endsWith('.PCX'));

    if (files.length === 0) {
        console.log('No PCX files found in current directory.');
        return;
    }

    console.log(`Found ${files.length} PCX files. Converting...`);
    for (const file of files) {
        try {
            const filePath = path.join(dir, file);
            await pcxToPng(filePath);
        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error instanceof Error ? error.message : error);
        }
    }
    console.log('✅ All files processed.');
})();