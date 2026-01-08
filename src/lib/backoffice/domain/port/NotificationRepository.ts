import { Notification } from "../entity/Notification";

export interface NotificationRepository {
    sendNotification(data:{
        title: string;
        message: string;
        userId: string;
    }): Promise<Notification>;

}