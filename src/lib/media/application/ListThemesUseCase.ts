
import { Inject } from '@nestjs/common';
import { IMediaRepository, IMEDIA_REPOSITORY } from '../domain/port/IMediaRepository';
import { Result } from '../../shared/Type Helpers/result';
import { Media } from '../domain/entity/Media';
import { IHandler } from 'src/lib/shared/IHandler';

// DTO para la respuesta del caso de uso, con el formato solicitado.
export type ThemeResponseDTO = {
  assetId: string;
  url: string;
  name: string;
  category: string;
  format: string;
  size: number;
  mimeType: string;
}[];

export class ListThemesUseCase implements IHandler<void, Result<ThemeResponseDTO>> {
  constructor(
    @Inject(IMEDIA_REPOSITORY) 
    private readonly mediaRepository: IMediaRepository
  ) {}

  async execute(): Promise<Result<ThemeResponseDTO>> {
    // Obtenemos los media que pertenecen a la categoría 'theme'.
    const mediaList: Media[] = await this.mediaRepository.findByCategory('theme');

    // Mapeamos las entidades al DTO de respuesta.
    const response: ThemeResponseDTO = mediaList.map(media => {
      const properties = media.properties();
      const nameParts = properties.originalName.split('.');
      // Extraer la extensión como formato. Si no hay, devuelve un string vacío.
      const format = nameParts.length > 1 ? nameParts.pop() || '' : '';
      
      return {
        assetId: properties.id,
        url: properties.url,
        name: properties.originalName, // Podríamos hacerlo más amigable en el futuro
        category: properties.category,
        format: format,
        size: properties.size,
        mimeType: properties.mimeType,
      };
    });

    return Result.ok<ThemeResponseDTO>(response);
  }
}
