import { Media } from '../entity/Media';

export interface MediaRepository {
  save(media: Media): Promise<void>;
  findById(id: string): Promise<Media | null>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Media[]>;
}