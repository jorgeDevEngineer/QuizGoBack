export interface IGeneratePinService {
    generateUniquePin(): Promise<string>;
}