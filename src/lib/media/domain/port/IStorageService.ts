import { Result } from '../../../shared/Type Helpers/result';

export const STORAGE_SERVICE = 'IStorageService';

// The object returned by the storage service after a successful upload
export interface StorageUploadResponse {
    url: string; // Publicly accessible URL
    key: string; // Identifier for the file in the storage system (e.g., S3 key, file path)
}

export interface IStorageService {
    upload(
        file: Buffer,
        fileName: string,
        mimeType: string,
    ): Promise<Result<StorageUploadResponse>>;

    delete(key: string): Promise<void>;
}
