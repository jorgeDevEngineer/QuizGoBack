import { UserId } from "../valueObject/UserId";
import { User } from "../aggregate/User";
import { UserName } from "../valueObject/UserName";

export interface UserRepository {

  searchUsers(params: {
    q?: string;
    limit?: number;
    page?: number;
    orderBy?: string;
    order: 'asc' | 'desc';
}): Promise<{
    data: {
        id: string;
        name: string;
        email: string;
        userType: string;
        createdAt: Date;
        status: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
}>;

  deleteUser(id: UserId): Promise<void>;
  
  blockUser(id: UserId): Promise<{
    user:{
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
    };
  }>;

  UnblockUser(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
    };
  }>;

  GiveAdminRole(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
      isadmin: boolean;
    };
  }>;

  RemoveAdminRole(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
      isadmin: boolean;
    };
  }>;

  getOneById(id: UserId): Promise<User | null>;

  getEmailNoadmin(): Promise<string[]>;

  getEmailAdmin(): Promise<string[]>;
}
