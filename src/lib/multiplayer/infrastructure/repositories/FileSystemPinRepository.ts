import * as path from 'path'
import * as fs from 'fs/promises';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IPinRepository } from '../../domain/repositories/IPinRepository';

@Injectable()
export class FileSystemPinRepository implements IPinRepository, OnModuleInit {

    private readonly memoryCache = new Set<string>();
    private readonly PIN_FILE_PATH: string;
    
    constructor() {
        const fileName = process.env.PIN_STORAGE_PATH || 'active_pins.txt';
        this.PIN_FILE_PATH = path.isAbsolute(fileName) 
            ? fileName 
            : path.join(process.cwd(), fileName);
    }

    async onModuleInit() {
        try {
            const fileContent = await fs.readFile(this.PIN_FILE_PATH, { encoding: 'utf-8' });
            fileContent.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .forEach(pin => this.memoryCache.add(pin));
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error;
        }
    }

    public async getActivePins(): Promise<Set<string>> {
        return new Set(this.memoryCache);
    }

    public async saveNewPin(pin: string): Promise<void> {
        this.memoryCache.add(pin);

        await fs.appendFile(this.PIN_FILE_PATH, `${pin}\n`, { encoding: 'utf-8' });
    }

    public async releasePin(pinToRemove: string): Promise<void> {
        try {
            if (!this.memoryCache.has(pinToRemove)) {
                console.warn(`Warning: PIN ${pinToRemove} no se encuentra en el registro de pins activos.`);
                return;
            }

            this.memoryCache.delete(pinToRemove);

            const newFileContent = Array.from(this.memoryCache).join('\n') + (this.memoryCache.size > 0 ? '\n' : '');
            
            await fs.writeFile(this.PIN_FILE_PATH, newFileContent, { encoding: 'utf-8' });

            console.log(`✅ PIN ${pinToRemove} liberado exitosamente.`);

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.error(`Error: PIN no encontrado en ${this.PIN_FILE_PATH}. No se puede liberar el PIN ${pinToRemove}.`);
                return;
            }
            throw error; 
        }
    }
}