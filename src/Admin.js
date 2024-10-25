class Admin extends User {
    constructor(username, password, profileInfo) {
        super(username, password, profileInfo);
    }

    manageUsers(user, action) {
        // Admin can ban or promote users
        console.log(`${action} user: ${user.username}`);
    }

    deleteThread(forum, thread) {
        forum.removeThread(thread);
        console.log(`Thread deleted: ${thread.title}`);
    }

    manageForumSettings(forum) {
        console.log(`Managing settings for forum: ${forum.name}`);
    }
}

class Moderator extends User {
    constructor(username, password, profileInfo) {
        super(username, password, profileInfo);
    }

    moderateContent(thread, post) {
        console.log(`Moderating content for thread: ${thread.title}`);
        // Lock thread, delete post, etc.
    }

    banUser(user, reason) {
        console.log(`User ${user.username} banned for: ${reason}`);
    }
}
