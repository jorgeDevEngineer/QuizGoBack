import { Media } from '../entity/Media';
import { MediaId } from '../valueObject/Media';

export interface MediaRepository {
  save(media: Media): Promise<void>;
  findById(id: MediaId): Promise<Media | null>;
  delete(id: MediaId): Promise<void>;
  findAll(): Promise<Media[]>;
}