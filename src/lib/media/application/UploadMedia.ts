import { IStorageService, StorageUploadResponse } from '../domain/port/IStorageService';
import { Media } from '../domain/entity/Media';
import { IMediaRepository } from '../domain/port/IMediaRepository';
import { Result } from '../../shared/Type Helpers/result';
import { IHandler } from '../../shared/IHandler';
import { Injectable } from '@nestjs/common';

export interface UploadMediaDTO {
    file: Buffer;
    fileName: string;
    mimeType: string;
    category: string;
    authorId: string;
}

@Injectable()
export class UploadMedia implements IHandler<UploadMediaDTO, Result<Media>> {
    constructor(
        private readonly storageService: IStorageService,
        private readonly mediaRepository: IMediaRepository,
    ) {}

    async execute(request: UploadMediaDTO): Promise<Result<Media>> {
        const { file, fileName, mimeType, category, authorId } = request;

        // 1. Upload the file to the storage service
        const uploadResult = await this.storageService.upload(
            file,
            fileName,
            mimeType,
        );

        if (uploadResult.isFailure) {
            return Result.fail(uploadResult.error);
        }

        const { url, key } = uploadResult.getValue();

        // 2. Create the Media entity
        const media = Media.create(
            url,
            key,
            category,
            mimeType,
            file.length, // size in bytes
            authorId,
            fileName, // originalName
            null, // thumbnailUrl (can be generated later)
        );

        // 3. Save the media entity to the repository
        await this.mediaRepository.save(media);

        return Result.ok(media);
    }
}
