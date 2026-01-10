import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";

export interface ActiveSessionContext { 
    session: MultiplayerSession, 
    quiz: Quiz,
}

// repositorio para las sesiones activas, no es persistencia. Para manejo de las sesiones en memoria
export interface IActiveMultiplayerSessionRepository {

    saveSession(sessionWraper: ActiveSessionContext): Promise<string>;
    findByPin(pin: string): Promise< ActiveSessionContext | null >;
    findByTemporalToken(token: string): Promise<ActiveSessionContext | null>;
    delete(pin: string): Promise<void>;

}