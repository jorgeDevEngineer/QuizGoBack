export class CreateSessionCommand {
    constructor(
        public readonly kahootId: string,
        public readonly hostId: string
    ){}
}