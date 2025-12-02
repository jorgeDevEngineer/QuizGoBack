import { HttpException } from '@nestjs/common';

export class Either<L extends HttpException, R> {
  private readonly value: L | R;
  private readonly left: boolean;

  private constructor(value: L | R, left: boolean) {
    this.value = value;
    this.left = left;
  }

  isLeft(): boolean {
    return this.left;
  }

  isRight(): boolean {
    return !this.left;
  }

  getLeft(): L {
    if (!this.isLeft()) {
      throw new Error('Data inválida');
    }
    return this.value as L;
  }

  getRight(): R {
    if (!this.isRight()) {
      throw new Error('Data inválida');
    }
    return this.value as R;
  }

  static makeLeft<L extends HttpException, R>(value: L) {
    return new Either<L, R>(value, true);
  }

  static makeRight<L extends HttpException, R>(value: R) {
    return new Either<L, R>(value, false);
  }
}