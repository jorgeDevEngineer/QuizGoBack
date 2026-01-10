import { Notification } from "../entity/Notification";

export interface NotificationRepository {
    sendNotification(data:{
        title: string;
        message: string;
        userId: string;
    }): Promise<
    {
        id: string;
        title: string;
        message: string;
        createdAt: Date;
        sender: {
            ImageUrl: string;
            id: string;
            name: string;
            email: string;
        }
    }
    >;


    getNotifications(
        params: {
            userId?: string;
            limit?: number;
            page?: number;
            orderBy?: string;
            order: 'asc' | 'desc';
        }
    ): Promise<
    {
        data: {
            id: string;
            title: string;
            message: string;
            createdAt: Date;
            sender: {
                ImageUrl: string;
                id: string;
                name: string;
                email: string;
            }
        }[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
    }>;

}