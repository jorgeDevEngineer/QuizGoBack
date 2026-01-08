export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: Error | null;
  private _value: T | null;

  private constructor(
    isSuccess: boolean,
    error?: Error | null,
    value?: T | null
  ) {
    if (isSuccess && error) {
      throw new Error(
        "InvalidOperation: A result cannot be successful and contain an error"
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        "InvalidOperation: A failing result needs to contain an error"
      );
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;

    Object.freeze(this);
  }

  public getValue(): T | null {
    if (!this.isSuccess) {
      // It's better to throw an error here or handle it gracefully
      // depending on the design decision.
      // For this implementation, we will log and return null.
      console.error("Cannot retrieve the value from a failed result.");
      return null;
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: Error | string): Result<U> {
    const errorObj = typeof error === "string" ? new Error(error) : error;
    return new Result<U>(false, errorObj);
  }
}
