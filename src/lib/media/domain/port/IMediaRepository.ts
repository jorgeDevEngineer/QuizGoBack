
import { Media } from "../entity/Media";

export const MEDIA_REPOSITORY = 'IMediaRepository';

export interface IMediaRepository {
  save(media: Media): Promise<void>;
  findById(id: string): Promise<Media | null>;
  findAll(): Promise<Media[]>;
  findAllByAuthor(authorId: string): Promise<Media[]>;
  delete(id: string): Promise<void>;
  findByCategory(category: string): Promise<Media[]>;
}
