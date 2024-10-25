import { UserService } from './userService';

export class AdminService extends UserService {
    constructor() {
        super();
    }

    // Promote a user to Admin
    promoteToAdmin(uid) {
        return this.updateUserRole(uid, 'admin');
    }

    // Demote a user to regular user
    demoteUser(uid) {
        return this.updateUserRole(uid, 'user');
    }

    // Delete a thread (admin privilege)
    deleteThread(threadId) {
        return db.collection('threads').doc(threadId).delete();
    }

    // Manage users (ban/unban)
    banUser(uid) {
        return this.updateUserRole(uid, 'banned');
    }
}
