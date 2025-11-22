export interface ImageOptimizationResult {
  buffer: Buffer;
  size: number;
  thumbnailBuffer: Buffer;
}

export const IMAGE_OPTIMIZER = 'ImageOptimizer';

export interface ImageOptimizer {
  optimize(buffer: Buffer, mimeType: string): Promise<ImageOptimizationResult | null>;
}
