import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../../domain/port/StorageProvider';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(process.cwd(), 'uploads');
    // ensure uploads dir exists
    fs.mkdir(this.basePath, { recursive: true }).catch(() => {});
  }

  async upload(file: Buffer | Uint8Array, fileName: string, mimeType: string): Promise<string> {
    const fileId = randomUUID();
    const ext = path.extname(fileName) || '';
    const filename = `${fileId}${ext}`;
    const dest = path.join(this.basePath, filename);
    // Normalize to a type accepted by fs.writeFile across lib combinations
    const data = Buffer.isBuffer(file) ? file : Buffer.from(file);
    // cast to any to satisfy TypeScript overloads across different lib combinations
    await fs.writeFile(dest, data as any);
    // return relative path (filename) so it can be stored in DB
    return filename;
  }

  async get(p: string): Promise<Buffer> {
    const full = path.join(this.basePath, p);
    return fs.readFile(full);
  }

  async delete(p: string): Promise<void> {
    const full = path.join(this.basePath, p);
    await fs.unlink(full).catch(() => {});
  }
}
