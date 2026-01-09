export class GetGroupMembersQuery {
    constructor(
        public readonly groupId: string,
        public readonly currentUserId: string
    ) {} 
}