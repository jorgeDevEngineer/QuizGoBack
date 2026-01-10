import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IGeneratePinService } from '../../domain/services/IGeneratePinService';
import { IPinRepository } from '../../domain/repositories/IPinRepository';

@Injectable()
export class CryptoGeneratePinService implements IGeneratePinService {

    private readonly MAX_ATTEMPTS = process.env.PIN_GENERATION_ATTEMPTS ? +process.env.PIN_GENERATION_ATTEMPTS : 50;

    constructor(
        @Inject( 'IPinRepository' )
        private readonly fileSystemRepo: IPinRepository
    ){}

    public async generateUniquePin(): Promise<string> {

        const activePins = await this.fileSystemRepo.getActivePins();

        let newPin: string;
        let attempts = 0;

        do {
            if (attempts >= this.MAX_ATTEMPTS ) {
                throw new Error(`Fallo al generar número aleatorio después de ${this.MAX_ATTEMPTS} intentos.`);
            }
            
            newPin = this.generateSecurePin();
            attempts++;
            
        } while (activePins.has(newPin));

        await this.fileSystemRepo.saveNewPin(newPin);

        return newPin;
    }


    public generateSecurePin(): string {

        const minLength = 6;
        const maxLength = 10;
        
        // 1. Elegimos la longitud aleatoriamente
        const pinLength = crypto.randomInt(minLength, maxLength + 1);

        // 2. Calculamos los límites numéricos para esa longitud
        // Ejemplo para 6 dígitos: min = 100,000; max = 999,999
        const minRange = Math.pow(10, pinLength - 1);
        const maxRange = Math.pow(10, pinLength);

        // 3. Generamos el número aleatorio directamente en el rango
        // randomInt(min, max) -> min es inclusivo, max es exclusivo.
        const pinNumber = crypto.randomInt(minRange, maxRange);

        return pinNumber.toString();
    }

}