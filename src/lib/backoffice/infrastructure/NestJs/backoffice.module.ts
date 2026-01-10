import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeController } from './backoffice.controller';
import { SearchUsersUseCase } from '../../application/SearchUsersUseCase';
import { TypeOrmUserRepository } from '../TypeOrm/TypeOrmUserRepository';
import { TypeOrmUserEntity } from '../TypeOrm/TypeOrmUserEntity';
import { TypeOrmNotificationRepository } from '../TypeOrm/TypeOrmNotificationRepository';
import { TypeOrmNotificationEntity } from '../TypeOrm/TypeOrmNotificationEntity';
import { BlockUserUseCase } from '../../application/BlockUserUseCase';
import { DeleteUserUseCase } from '../../application/DeleteUserUseCase';
import { SendNotificationUseCase } from '../../application/SendNotificationUseCase';
import { UnblockUserUseCase } from '../../application/UnblockUserUseCase';
import { GiveAdminRoleUseCase } from '../../application/GiveAdminUseCase';
import { RemoveAdminRoleUseCase } from '../../application/RemoveAdminUseCase';
import { GetNotificationsUseCase } from '../../application/GetNotificationUseCase';
import { SMTPSendMailService } from '../SMTP/SMTPSendMailService';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity, TypeOrmNotificationEntity])],
  controllers: [BackofficeController],
  providers: [
    SearchUsersUseCase,
    BlockUserUseCase,
    UnblockUserUseCase,
    DeleteUserUseCase,
    SendNotificationUseCase,
    GiveAdminRoleUseCase,
    RemoveAdminRoleUseCase,
    GetNotificationsUseCase,
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'NotificationRepository',
      useClass: TypeOrmNotificationRepository,
    },
    {
      provide: 'SendMailService',
      useClass: SMTPSendMailService,
    }
  ],
  exports: [SearchUsersUseCase, BlockUserUseCase, DeleteUserUseCase, SendNotificationUseCase, UnblockUserUseCase, GiveAdminRoleUseCase, RemoveAdminRoleUseCase, GetNotificationsUseCase],
})
export class BackofficeModule {}
