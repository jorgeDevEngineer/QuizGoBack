export class StartSinglePlayerGameCommand {
  constructor(
    public readonly kahootId: string,
    public readonly playerId: string
  ) {}
}