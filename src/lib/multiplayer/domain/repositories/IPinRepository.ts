

export interface IPinRepository {

    getActivePins(): Promise<Set<string>>;
    saveNewPin(pin: string): Promise<void>;
    releasePin(pinToRemove: string): Promise<void> 

}