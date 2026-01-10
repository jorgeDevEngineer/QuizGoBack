import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { Player } from "../entities/Player";
import { Leaderboard, 
        LeaderboardEntry, 
        MultiplayerAnswer, 
        MultiplayerQuestionResult, 
        SessionPin, 
        SessionProgress, 
        SessionState,
        SessionStateType,
        StateTransition,
        StateTransitionsTypes
} from "../valueObjects/multiplayerVOs";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { PlayerId } from "../valueObjects/playerVOs";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";

export class MultiplayerSession {

    private constructor(
        private readonly sessionId: MultiplayerSessionId,
        private readonly hostId: UserId,
        private readonly quizId: QuizId,
        private readonly sessionPin: SessionPin,
        private readonly startedAt: Date,
        private completedAt: Optional<Date>,
        private currentQuestionStartTime: Date,
        private sessionState: SessionState,
        private leaderboard: Leaderboard,
        private progress: SessionProgress,
        private players: Map<string, Player>, // PlayerId ---> Player
        private playersAnswers: Map<string, MultiplayerQuestionResult> //QuestionId ----> MultiplayerQuestionResult
    ) {}

    protected checkInvariants(): void {
        // * Invarianzas de Estado de completación de la partida y valores que deberian estar presentes
        if(!this.sessionState.isEnd()){
            throw new Error("Invarianza violada: La partida debe estar END al ser cargada, pues debió finalizar para ser guardada");
        }
        if(!this.getCompletionDate()){
            throw new Error("Invarianza violada: La partida no tiene fecha de culminación");
        }
        if(!this.getStartingDate()){
            throw new Error("Invarianza violada: La partida no tiene fecha de inicio");
        }
        if(this.hasMoreQuestionsToAnswer()){
            throw new Error("Invarianza violada: La partida está incompleta, quedan slides por jugar");
        }

        // * Invarianzas de Jugadores asociados a la partida y sus puntuaciones y respuestas
        if(this.players.has( this.getHostId().value)){
            throw new Error("Invarianza violada: El Host esta resgistrado como jugador en la partida");
        }
        if(this.players.size < 1 ){
            throw new Error("Invarianza violada: La partida tiene 0 jugadores asociados");
        }
        if(this.getTotalOfQuestions() !== this.playersAnswers.size){
            throw new Error("Invarianza violada: La partida tiene menos respuestas totales para cada slide que el numero de slides jugadas");
        }
        if(this.getCurrentQuestionIndex() !== this.playersAnswers.size){
            throw new Error("Invarianza violada: El numero de respuestas registradas es incoherente con el numero de slides respondidos");
        }

        const players = this.getPlayers();
        for( const player of players ){
            const score = player.getScore();
            const results = this.getOnePlayerAnswers(player.getId()).map( results => results ? results.getEarnedScore() : 0 );
            const totalScore = results.reduce(( resA, resB ) => resA + resB , 0);
            if( totalScore !== score.getScore() ){
                throw new Error(`Invarianza violada: el puntaje del jugador id: ${ player.getId() } nickname: ${ player.getNickname() } is incoherente, la suma del puntaje de sus respuestas no es igual a su puntaje acumulado`);
            }
        }
    }

    public validateAllInvariantsForCompletion(): void{
        this.checkInvariants();
    }

    public isPlayerAlreadyJoined(playerId: PlayerId): boolean {
        return this.players.has(playerId.getId());
    }

    public addEntryToScoreboard(player: Player): void {
        this.leaderboard = this.leaderboard.addLeaderboardEntry(player);
    }

    public joinPlayer(player: Player): void {

        if(player.getId().getId() === this.hostId.value){
            throw new Error("El host de una partida no puede unirse como jugador a la misma")
        }

        if(this.isPlayerAlreadyJoined(player.getId())){
            return;
        }

        if( !this.sessionState.isLobby() ){
            throw new Error("La partida ya empezó y no se admiten nuevos jugadores");
        }
        this.players.set( player.getId().getId() , player );
        this.addEntryToScoreboard( player );
    }

    public deletePlayer(playerId: PlayerId): boolean {
        if( !this.sessionState.isLobby() ){
            throw new Error("La partida ya empezó y no se pueden eliminar jugadores");
        }
        return this.players.delete( playerId.getId() );
    }

     public startQuestionResults(questionId: QuestionId ): void{
        this.playersAnswers.set(questionId.value , MultiplayerQuestionResult.create( questionId ) );
    }

    private addQuestionResult(questionId: QuestionId, result: MultiplayerQuestionResult): void{
        this.playersAnswers.set( questionId.value , result );
    }

    public addPlayerAnswer(questionId: QuestionId, playerAnswer: MultiplayerAnswer): void{
        if(!this.playersAnswers.has(questionId.value)){
            throw new Error("La pregunta a la cual se intenta añadir una entrada no ha sido puesta aun en juego o no existe")
        }
        const updatedSlideResult = this.playersAnswers.get(questionId.value)?.addResult(playerAnswer)!;
        this.addQuestionResult( questionId, updatedSlideResult);
    }

    public updatePlayersScores(results: MultiplayerQuestionResult): void {
        const playerResults = results.getPlayersAnswers();
        for(const result of playerResults){
            const player = this.players.get(result.getPlayerId().getId());
            player?.newScore( player.getScore().getScore() + result.getEarnedScore() );
            player?.updateStreak( result.getIsCorrect() );
        }
    }

     public updateLeaderboard(): void {
        this.leaderboard = this.leaderboard.updateLeaderboard(this.getPlayers());
    }

    public updateProgress( nextQuestionId: QuestionId ): void {
        this.progress = this.progress.addQuestionAnswered( nextQuestionId );
    }

    public completeProgess(): void {
        this.progress = this.progress.completeProgress();
    }

    private startQuestion(): void {
        this.sessionState = this.sessionState.toQuestion();
        this.currentQuestionStartTime = new Date();
    }

    public startSession(): void {
        if( this.getCurrentQuestionIndex() !== 0 ){
            throw new Error("No se puede empezar una partida en una slide que no sea la primero (O la partida ya comenzó)");
        }
        if( this.players.size < 1 ){
            throw new Error("No se puede empezar una partida con menos de un jugador conectado");
        }
        if( !this.sessionState.isLobby() ){
            throw new Error("No se puede empezar una partida desde un estado que no esa LOBBY");
        }
        this.startQuestion();
    }

    private transitionToResults(): StateTransition {
        if( !this.sessionState.isQuestion() ){
            throw new Error("No se puede pasar a RESULTS desde un estado que no sea QUESTION");
        }
        this.sessionState = this.sessionState.toResults();
        return {state: StateTransitionsTypes.TRANSITION_TO_RESULTS};
    }

    private transitionFromResults(): StateTransition {
        if( !this.sessionState.isResults() ){
            throw new Error("No se puede pasar a QUESTION desde un estado que no sea RESULTS");
        }
        if(!this.progress.hasMoreQuestionsToAnswer()){
            return this.endSession(); 
        }
        this.startQuestion();
        return {state: StateTransitionsTypes.TRANSITION_TO_QUESTION};
    }

    public advanceToNextPhase(): StateTransition {
        const currentState = this.sessionState;
        if(currentState.isQuestion()){
            return this.transitionToResults();
        }
        if(currentState.isResults()){
            return this.transitionFromResults();
        }
        throw new Error(`Desde el estado ${currentState.getState()} no se puede pasar a RESULT o QUESTION`);
    }

    private endSession(): StateTransition{
        this.sessionState = this.sessionState.toEnd();
        this.completedAt = new Optional<Date>( new Date() );
        return { state: StateTransitionsTypes.TRANSITION_TO_END };
    }

    public getNumberOfAnswersForAQuestion( questionId: QuestionId ): number{
        return this.getPlayersAnswersForAQuestion( questionId ).length
    }
    
    public getPlayersAnswersForAQuestion(questionId: QuestionId): MultiplayerAnswer[] {
        if( !this.playersAnswers.has(questionId.value) ){
            throw new Error("Los resultados de la Slide solicitada no existen, o no se han registrado resultados aún para la misma");  
        }
        const playerAnswers = this.playersAnswers.get( questionId.value )?.getPlayersAnswers()!;
        return playerAnswers;
    }

    public getOnePlayerAnswers( playerId: PlayerId ): (MultiplayerAnswer | undefined)[] {
        if( !this.players.has( playerId.getId() ) ){
            throw new Error("El jugador solicitado no se encuentra en la partida");  
        }
        const questionResults = this.getMultiplayerQuestionsResults();
        const playerAnswers = questionResults.map( result => {
           return result.searchPlayerAnswer( playerId );
        })
        return playerAnswers;
    }

    public getOnePlayerAnswerForAQuestion( questionId: QuestionId, playerId: PlayerId ): MultiplayerAnswer | undefined {
        const questionResults = this.getQuestionResultsByQuestionId( questionId );
        const answer = questionResults.searchPlayerAnswer( playerId );
        return answer;
    }

    public hasPlayerAnsweredQuestion( questionId: QuestionId, playerId: PlayerId ): boolean { 
        return this.getOnePlayerAnswerForAQuestion( questionId, playerId ) !== undefined;
    }

    public calculateAnswerDistributionForAQuestion( questionId: QuestionId, possibleOptionIds: string[] ): Record<string, number> {
        const distribution: Record<string, number> = {};
        possibleOptionIds.forEach(id => {
            distribution[id] = 0;
        });

        for (const player of this.players.values()) { 
            const answer = this.getOnePlayerAnswerForAQuestion( questionId, player.getId() );

            if (answer) {
                const selectedIds = answer.getAnswerIndex(); 
                selectedIds.forEach( optionId => {
                    const optionIdString = optionId.toString()
                    if (distribution[optionIdString] !== undefined) {
                        distribution[optionIdString]++;
                    }
                });
            }
        }
        return distribution;
    }

    public getPlayersLeaderboardEntries(): LeaderboardEntry[] {
        return this.leaderboard.getEntries();
    }

    public getOnePlayerLeaderboardEntry( playerId: PlayerId ): LeaderboardEntry {
        return this.leaderboard.getEntryFor( playerId );
    }

    public getPlayersScores(): ([PlayerId , number])[] {
        const playerScores = this.getPlayers()
                                .map( player => { 
                                    const playerData: [ PlayerId , number ] = [ player.getId() , player.getScore().getScore() ]
                                    return playerData;
                                });
        return playerScores;
    }

    public getPlayers(): Player[] {
        return [...this.players.values()] ;
    }

    public getPlayerById(playerId: PlayerId): Player {
        if( !this.isPlayerAlreadyJoined(playerId)){
            throw new Error("El jugador no se encuentra unido a la sesión");
        }
        return this.players.get(playerId.getId())!
    }

    public getTopThree(): LeaderboardEntry[] {
        return this.leaderboard.getTop(3) ;
    }  

    public getTopFive(): LeaderboardEntry[] {
        return this.leaderboard.getTop(5) ; 
    }  

    public getLeaderboardEntryFor(playerId: PlayerId): LeaderboardEntry {
        return this.leaderboard.getEntryFor( playerId ) ;   
    }

    public getSessionProgressPercentage(): number {
        return this.progress.getProgressPercentage() ;
    }

    public getSessionProgress(): SessionProgress {
        return this.progress;
    }

    public getNumberOfQuestionsLeft(): number {
        return this.progress.getHowManyQuestionsAreLeft() ;
    }

    public getCurrentQuestionIndex(): number {
        return this.progress.getQuestionsAnswered() ;
    }

    public getTotalOfQuestions(): number {
        return this.progress.getTotalQuestions() ;
    }

    public hasMoreQuestionsToAnswer(): boolean {
        return this.progress.hasMoreQuestionsToAnswer() ;
    }

    public getMultiplayerQuestionsResults(): MultiplayerQuestionResult[] {
        return [...this.playersAnswers.values()]
    }

    public getQuestionResultsByQuestionId( questionId: QuestionId ): MultiplayerQuestionResult {
        if( !this.playersAnswers.has( questionId.value )){
            throw new Error("La pregunta solicitada no tiene resultados");
        }
        return this.playersAnswers.get( questionId.value )!
    }

    public getCurrentQuestionInSession(): QuestionId {
        return this.progress.getCurrentQuestion();
    }

    public getPreviousQuestionInSession(): QuestionId | undefined{
        return this.progress.getPreviousQuestion();
    }

    public getSessionPin(): string {
        return this.sessionPin.getPin();
    }

    public getSessionStateType(): SessionStateType{
        return this.sessionState.getState();
    }

    public getSessionState(): SessionState {
        return this.sessionState;
    }

    public getStartingDate(): Date{
        return this.startedAt;
    }

    public getCompletionDate(): Date {
        if( !this.completedAt.hasValue() ){
            throw new Error("FATAL: La sesión no tiene fecha de completación, posiblemente la partida no se ha completado o no se completó")
        }
        return this.completedAt.getValue();
    }

    public getCurrentQuestionStartTime(): Date {
        return this.currentQuestionStartTime;
    }

    public getHostId(): UserId {
        return this.hostId;
    }

    public getQuizId(): QuizId {
        return this.quizId;
    }

    public getId(): MultiplayerSessionId {
        return this.sessionId;
    }

    public static fromDb(
        sessionId: MultiplayerSessionId,
        hostId: UserId,
        quizId: QuizId,
        sessionPin: SessionPin,
        startedAt: Date,
        completedAt: Optional<Date>,
        currentQuestionStartTime: Date,
        sessionState: SessionState,
        leaderboard: Leaderboard,
        progress: SessionProgress,
        players: Map<string, Player>, // PlayerId ---> Player
        playersAnswers: Map<string, MultiplayerQuestionResult>
    ) {
        return new MultiplayerSession(sessionId, hostId, quizId, sessionPin, startedAt, completedAt, currentQuestionStartTime, sessionState, leaderboard, progress, players, playersAnswers);
    }
    
}
