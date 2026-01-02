import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Query,
    Delete,
    Post,
    Body,
    BadRequestException,
  } from '@nestjs/common';
  import { IsString, Length } from 'class-validator';
  import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
  import { BlockUserUseCase } from '../../application/BlockUserUseCase';
  import { DeleteUserUseCase } from '../../application/DeleteUserUseCase';
  import { SendNotificationUseCase } from '../../application/SendNotificationUseCase';
  import { NotificationDto } from '../../application/SendNotificationUseCase';

export class FindOneParams {
    @IsString()
    @Length(5, 255)
    id: string;
 }

@Controller('')
export class BackofficeController {
    constructor(
        private readonly searchUsersUseCase: SearchUsersUseCase,
        private readonly blockUserUseCase: BlockUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
    ){}

    @Get('users')
    async searchUser(
        @Query('q') q?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {

            const result = await this.searchUsersUseCase.run({ 
                q, 
                limit, 
                page, 
                orderBy, 
                order 
            });
            
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('users/:userId')
    async blockUser(
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.blockUserUseCase.run(userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Delete('users/:userId')
    async deleteUser(@Param('userId') userId: string) {
        try {
            const result = await this.deleteUserUseCase.run(userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Post('admin/notifications')
    async sendNotification(@Body() body: NotificationDto) {
        try {
            const result = await this.sendNotificationUseCase.run(body);
            return result;
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }
}