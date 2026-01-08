import {
  IStorageService,
  StorageUploadResponse,
} from "../domain/port/IStorageService";
import { promises as fs } from "fs";
import * as path from "path";
import { Result } from "../../shared/Type Helpers/result";

export class LocalStorageService implements IStorageService {
  private readonly storagePath = path.join(
    __dirname,
    ".._.._.._../public/uploads"
  );

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string // MimeType is now a parameter
  ): Promise<Result<StorageUploadResponse>> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });

      const uniqueFileName = `${Date.now()}-${fileName}`;
      const filePath = path.join(this.storagePath, uniqueFileName);
      await fs.writeFile(filePath, file);

      const url = `/uploads/${uniqueFileName}`;

      const response: StorageUploadResponse = {
        url: url,
        key: filePath, // Using the full file path as the key
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(key); // The key is the full file path
    } catch (error) {
      console.error(`Local storage delete failed: ${error}`);
    }
  }
}
