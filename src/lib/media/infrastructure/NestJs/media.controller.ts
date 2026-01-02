
import {
  Controller,
  Post,
  Get,
  Inject,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMedia, UploadMediaDTO } from '../../application/UploadMedia';
import { ListThemesUseCase } from '../../application/ListThemesUseCase';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('media')
export class MediaController {
  constructor(
    @Inject(UploadMedia)
    private readonly uploadMedia: UploadMedia,
    @Inject(ListThemesUseCase)
    private readonly listThemes: ListThemesUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedFile, @Body() body: any) {
    if (!file) {
      throw new HttpException('No file received. Ensure the request is multipart/form-data and the field name is \"file\".', HttpStatus.BAD_REQUEST);
    }

    const dto: UploadMediaDTO = {
      file: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      category: body.category,
      authorId: body.authorId,
    };
    
    const result = await this.uploadMedia.execute(dto);
    
    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const media = result.getValue();
    return media.properties();
  }

  @Get('themes')
  async getThemes() {
    const result = await this.listThemes.execute();

    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.getValue();
  }
}
