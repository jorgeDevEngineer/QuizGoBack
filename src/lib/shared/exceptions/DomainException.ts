import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción base de dominio
 */
export abstract class DomainException extends HttpException {
  protected constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}