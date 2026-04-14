import sharp from "sharp"

export async function processIconBase64(imgData: string, width: number, height: number): Promise<Buffer> {
    return sharp(Buffer.from(imgData, 'base64'))
    .resize(width, height)
    .png()
    .toBuffer()
}
