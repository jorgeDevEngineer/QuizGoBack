import { IsString, Length } from "class-validator";

export class FindByIdParams {
  @IsString()
  id: string;
}

export class FindByUserNameParams {
  @IsString()
  userName: string;
}

export class Create {
  @IsString()
  @Length(6, 20)
  id: string;
  @IsString()
  userName: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  userType: "student" | "teacher" | "personal";
  @IsString()
  avatarUrl: string;
  @IsString()
  status: "Active" | "Blocked";
}

export class Edit {
  @IsString()
  userName: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  userType: "student" | "teacher" | "personal";
  @IsString()
  avatarUrl: string;
  @IsString()
  name: string;
  @IsString()
  theme: string;
  @IsString()
  language: string;
  @IsString()
  gameStreak: number;
  @IsString()
  status: "Active" | "Blocked";
}
