import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Query,
    Headers,
    Delete,
    Post,
    Body,
    BadRequestException,
  } from '@nestjs/common';
  import { IsString, Length } from 'class-validator';
  import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
  import { BlockUserUseCase } from '../../application/BlockUserUseCase';
  import { UnblockUserUseCase } from '../../application/UnblockUserUseCase';
  import { DeleteUserUseCase } from '../../application/DeleteUserUseCase';
  import { GiveAdminRoleUseCase } from '../../application/GiveAdminUseCase';
  import { RemoveAdminRoleUseCase } from '../../application/RemoveAdminUseCase';
  import { SendNotificationUseCase } from '../../application/SendNotificationUseCase';
  import { GetNotificationsUseCase } from '../../application/GetNotificationUseCase';
  

export class FindOneParams {
    @IsString()
    @Length(5, 255)
    id: string;
 }

@Controller('backoffice')
export class BackofficeController {
    constructor(
        private readonly searchUsersUseCase: SearchUsersUseCase,
        private readonly blockUserUseCase: BlockUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly UnblockUserUseCase: UnblockUserUseCase,
        private readonly giveAdminRoleUseCase: GiveAdminRoleUseCase,
        private readonly removeAdminRoleUseCase: RemoveAdminRoleUseCase,
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
    ){}

    @Get('users')
    async searchUser(
        @Headers('userId') userId: string,
        @Query('q') q?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {
            const result = await this.searchUsersUseCase.run(userId, { 
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

    @Patch('blockUser/:userId')
    async blockUser(
        @Headers('user') userIdHeader: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.blockUserUseCase.run(userIdHeader, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('unblockUser/:userId')
    async unblockUser(
        @Headers('user') userIdHeader: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.UnblockUserUseCase.run(userIdHeader, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Delete('user/:userId')
    async deleteUser(
        @Headers('user') userIdHeader: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.deleteUserUseCase.run(userIdHeader, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('giveAdmin/:userId')
    async giveAdminRole(
        @Headers('user') userIdHeader: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.giveAdminRoleUseCase.run(userIdHeader, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Patch('removeAdmin/:userId')
    async removeAdminRole(
        @Headers('user') userIdHeader: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.removeAdminRoleUseCase.run(userIdHeader, userId);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Post('massNotifications')
    async sendNotification(
        @Headers('user') userIdHeader: string,
        @Body() body: {
            title: string;
            message: string;
            filters: {
                toAdmins: boolean,
                toRegularUsers: boolean
            }
        },
    ) {
        try {
            const result = await this.sendNotificationUseCase.run(userIdHeader, {
                title: body.title,
                message: body.message,
                userId: userIdHeader,
                filters: body.filters,
            });
            return result;
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @Get('massNotifications')
    async getNotifications(
        @Headers('user') userIdHeader: string,
        @Query('userId') userId?: string,
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {
            const result = await this.getNotificationsUseCase.run(userIdHeader, {
                userId,
                limit,
                page,
                orderBy,
                order,
            });
            return result;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }
}