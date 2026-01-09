
export const IMAGE_OPTIMIZER = 'ImageOptimizer';

export interface ImageOptimizer {
  optimize(buffer: Buffer): Promise<Buffer>;
}
