
import { MediaRepository } from '../domain/port/MediaRepository';
import { IUseCase } from '../../../common/interfaces/use-case.interface';

// El DTO para la respuesta, que coincide con el nuevo método de la entidad
export type ListMediaResponseDTO = {
  id: string;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: Date;
  thumbnail: string | null;
}[];

export class ListMediaUseCase implements IUseCase<void, ListMediaResponseDTO> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(): Promise<ListMediaResponseDTO> {
    const mediaList = await this.mediaRepository.findAll();
    
    // Usamos el método `toListResponse` para transformar cada entidad
    return mediaList.map(media => media.toListResponse());
  }
}
