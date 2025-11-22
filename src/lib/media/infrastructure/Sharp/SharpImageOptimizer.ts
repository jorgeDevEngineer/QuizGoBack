import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import {
  ImageOptimizer,
  ImageOptimizationResult,
} from '../../domain/port/ImageOptimizer';

@Injectable()
export class SharpImageOptimizer implements ImageOptimizer {
  async optimize(
    buffer: Buffer,
    mimeType: string,
  ): Promise<ImageOptimizationResult | null> {
    const isImage = mimeType.startsWith('image/');
    if (!isImage) {
      return null;
    }

    try {
      const sharpInstance = sharp(buffer);

      // Generar buffer de imagen principal comprimida
      const compressedBuffer = await sharpInstance
        .jpeg({ quality: 80, progressive: true, optimizeScans: true })
        .png({ quality: 80 })
        .webp({ quality: 80 })
        .toBuffer();

      // Generar buffer de la miniatura
      const thumbnailBuffer = await sharpInstance
        .resize({ width: 200, height: 200, fit: 'cover' }) // Redimensionar
        .jpeg({ quality: 60 }) // Comprimir aún más la miniatura
        .toBuffer();

      const originalSize = buffer.length;
      const finalBuffer = compressedBuffer.length < originalSize ? compressedBuffer : buffer;
      const finalSize = finalBuffer.length;

      if (compressedBuffer.length < originalSize) {
        console.log(`Image compressed: ${originalSize} bytes -> ${finalSize} bytes`);
      } else {
        console.log('La compresión no redujo el tamaño. Se usará el original.');
      }

      return {
        buffer: finalBuffer,
        size: finalSize,
        thumbnailBuffer,
      };

    } catch (error) {
      console.error('Error durante la compresión de la imagen:', error);
      return null;
    }
  }
}
