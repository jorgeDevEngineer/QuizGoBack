import {
  Controller,
  Post,
  Get,
  Delete,
  Inject,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadMedia, UploadMediaDTO } from '../../application/UploadMedia';
import { GetMedia } from '../../application/GetMedia';
import { DeleteMedia } from '../../application/DeleteMedia';

// Typed shape for uploaded files (keeps code independent from global Multer types)
interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('media')
export class MediaController {
  constructor(
    @Inject('UploadMedia')
    private readonly uploadMedia: UploadMedia,
    @Inject('GetMedia')
    private readonly getMedia: GetMedia,
    @Inject('DeleteMedia')
    private readonly deleteMedia: DeleteMedia,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedFile) {
    const dto: UploadMediaDTO = {
      file: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
    const media = await this.uploadMedia.run(dto);
    return media;
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.getMedia.run(id);
      res.setHeader('Content-Type', result.media.mimeType.value);
      res.send(result.file);
    } catch (err) {
      throw new NotFoundException((err as Error).message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteMedia.run(id);
  }
}
