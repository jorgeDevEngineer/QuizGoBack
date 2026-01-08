import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IMultiplayerSessionHistoryRepository } from "src/lib/multiplayer/domain/repositories/IMultiplayerSessionHistoryRepository";
import { TypeOrmMultiplayerSessionEntity } from "./TypeOrmMultiplayerSessionEntity";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";

@Injectable()
export class MultiplayerSessionHistoryTypeOrmRepository implements IMultiplayerSessionHistoryRepository {

    constructor(
        @InjectRepository(TypeOrmMultiplayerSessionEntity)
        private readonly sessionRepository: Repository<TypeOrmMultiplayerSessionEntity>,
    ) {}

    async archiveSession(session: MultiplayerSession): Promise<void> {
        session.validateAllInvariantsForCompletion();
        const entity = TypeOrmMultiplayerSessionEntity.fromDomain(session);
        await this.sessionRepository.save(entity);
    }

    async findbyId(sessionId: MultiplayerSessionId): Promise<MultiplayerSession | null> {
        const entity = await this.sessionRepository.findOne({
            where: { sessionId: sessionId.getId() }
        });
        return entity ? entity.toDomain() : null;
    }
}
