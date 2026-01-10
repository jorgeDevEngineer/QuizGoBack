export interface SendMailService {
    sendMail(email: string, title: string, message: string): Promise<void>;
}