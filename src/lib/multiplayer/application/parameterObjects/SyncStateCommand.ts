export class SyncStateCommand {

    constructor(
        public readonly sessionPin: string,
        public readonly userId: string,
        // public readonly role: string,
    ){}

}