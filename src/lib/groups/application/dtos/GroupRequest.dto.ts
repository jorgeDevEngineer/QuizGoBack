export class CreateGroupRequestDto {
  name!: string;
}

export class UpdateGroupDetailsRequestDto {
  name?: string;
  description?: string | null;
}

export class AssignQuizToGroupRequestDto {
  quizId!: string;
  availableUntil!: string; 
}
