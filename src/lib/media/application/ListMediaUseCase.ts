import { Inject, Injectable } from "@nestjs/common";
import { Media } from "../domain/entity/Media";
import { MediaRepository } from "../domain/port/MediaRepository";

@Injectable()
export class ListMediaUseCase {
    constructor(
        @Inject('MediaRepository')
        private readonly mediaRepository: MediaRepository
    ) {}

    async execute(): Promise<Media[]> {
        return this.mediaRepository.findAll();
    }
}
