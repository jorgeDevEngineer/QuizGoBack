export interface CreateSessionResponseDto {

    readonly sessionPin: string,
    readonly qrToken: string,

    // Kahoot Info (para el host que creo la sesion)
    quizTitle: string, 
    coverImageUrl: string;
    theme: {
        id: string;
        url: string;
        name: string;
    } | null;

}