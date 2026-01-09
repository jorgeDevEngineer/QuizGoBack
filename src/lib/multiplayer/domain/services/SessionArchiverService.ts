import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { IActiveMultiplayerSessionRepository } from "../repositories/IActiveMultiplayerSessionRepository";
import { IMultiplayerSessionHistoryRepository } from "../repositories/IMultiplayerSessionHistoryRepository";

export class SessionArchiverService {

    constructor(
        private historyRepo: IMultiplayerSessionHistoryRepository,
        private activeRepo: IActiveMultiplayerSessionRepository
    ){}

    async archiveAndClean( session: MultiplayerSession): Promise<void> {
        session.validateAllInvariantsForCompletion();

        await this.historyRepo.archiveSession(session);
        
        await this.activeRepo.delete( session.getSessionPin() );
    }
}