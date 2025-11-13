export interface StorageProvider {
  // Sube el archivo y devuelve el path relativo
  upload(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  
  // Recupera el binario dado un path
  get(path: string): Promise<Buffer>; 
  
  // Borra el archivo físico
  delete(path: string): Promise<void>;
}