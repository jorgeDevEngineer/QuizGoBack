export class PlayerJoinCommand {

    constructor(
        public readonly userId: string,
        public readonly nickname: string,
        public readonly sessionPin: string,
    ){}

}