import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { SendMailService } from "../../domain/port/SendMailService";

@Injectable()
export class SMTPSendMailService implements SendMailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<string>('SMTP_SECURE') === 'true',
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async sendMail(email: string, title: string, message: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM'),
            to: email,
            subject: title,
            html: message,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Correo enviado exitosamente a: ${email}`);
        } catch (error) {
            console.error(`Error al enviar correo a ${email}:`, error);
            throw error;
        }
    }
}
