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

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity, TypeOrmNotificationEntity])],
  controllers: [BackofficeController],
  providers: [
    SearchUsersUseCase,
    BlockUserUseCase,
    DeleteUserUseCase,
    SendNotificationUseCase,
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'NotificationRepository',
      useClass: TypeOrmNotificationRepository,
    }
  ],
  exports: [SearchUsersUseCase, BlockUserUseCase, DeleteUserUseCase, SendNotificationUseCase],
})
export class BackofficeModule {}
