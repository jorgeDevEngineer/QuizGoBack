
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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadMedia, UploadMediaDTO } from '../../application/UploadMedia';
import { GetMedia } from '../../application/GetMedia';
import { DeleteMedia } from '../../application/DeleteMedia';
import { ListMediaUseCase } from '../../application/ListMediaUseCase';

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
    @Inject(GetMedia)
    private readonly getMedia: GetMedia,
    @Inject(DeleteMedia)
    private readonly deleteMedia: DeleteMedia,
    @Inject(ListMediaUseCase)
    private readonly listMedia: ListMediaUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new HttpException('No file received. Ensure the request is multipart/form-data and the field name is "file".', HttpStatus.BAD_REQUEST);
    }

    const dto: UploadMediaDTO = {
      file: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
    
    const result = await this.uploadMedia.execute(dto);
    
    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const media = result.getValue();
    return media.properties();
  }

  @Get()
  async getAll() {
    const result = await this.listMedia.execute();
    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.getValue();
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getMedia.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    const { media, file: fileBuffer } = result.getValue();
    res.setHeader('Content-Type', media.mimeType.value);
    res.send(fileBuffer);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteMedia.execute(id);
    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
  }
}
