import { Media } from '../entity/Media';

export const IMEDIA_REPOSITORY = 'IMediaRepository';

export interface IMediaRepository {
    save(media: Media): Promise<void>;
    findAllByAuthor(authorId: string): Promise<Media[]>;
    findById(id: string): Promise<Media | null>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Media[]>;
    findByCategory(category: string): Promise<Media[]>; // Nuevo método
}
