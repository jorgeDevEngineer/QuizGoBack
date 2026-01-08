import { UuidGenerator } from "../../domain/ports/UuuidGenerator";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class CryptoUuidGenerator implements UuidGenerator {

  generate(): string {
    return randomUUID(); 
  }

}