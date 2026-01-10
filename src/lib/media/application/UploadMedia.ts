
import { IStorageService } from '../domain/port/IStorageService';
import { Media } from '../domain/entity/Media';
import { IMediaRepository } from '../domain/port/IMediaRepository';
import { Result } from '../../shared/Type Helpers/result';
import { IHandler } from '../../shared/IHandler';
import { Injectable } from '@nestjs/common';
import { AuthorId, MediaCategory, MediaName, MediaUrl, MediaMimeType, MediaSize, MediaFormat } from '../domain/value-object/MediaId';
import * as path from 'path';

export interface UploadMediaDTO {
    file: Buffer;
    fileName: string;
    mimeType: string;
    category?: string;
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

        try {
            // 1. Upload the file to the storage service
            const uploadResult = await this.storageService.upload(
                file,
                fileName,
                mimeType,
            );

            if (uploadResult.isFailure) {
                return Result.fail(uploadResult.error);
            }

            const { url } = uploadResult.getValue();

            // 2. Create the Media entity
            const media = Media.create(
                AuthorId.of(authorId),
                MediaName.of(fileName),
                MediaUrl.of(url),
                MediaMimeType.of(mimeType),
                MediaSize.of(file.length),
                MediaFormat.of(path.extname(fileName)),
                MediaCategory.of(category ?? 'generic'),
            );

            // 3. Save the media entity to the repository
            await this.mediaRepository.save(media);

            return Result.ok(media);
        } catch (error) {
            return Result.fail(error);
        }
    }
}
