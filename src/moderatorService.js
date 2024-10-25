import { UserService } from './userService';

export class ModeratorService extends UserService {
    constructor() {
        super();
    }

    // Lock a thread (moderator privilege)
    lockThread(threadId) {
        return db.collection('threads').doc(threadId).update({
            locked: true
        });
    }

    // Remove inappropriate post
    removePost(threadId, postId) {
        return db.collection('threads').doc(threadId)
            .collection('posts').doc(postId).delete();
    }
}
