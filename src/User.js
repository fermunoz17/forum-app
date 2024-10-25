class User {
    constructor(username, password, profileInfo) {
        this.username = username;
        this.password = password;
        this.profileInfo = profileInfo;
        this.threads = [];
        this.posts = [];
    }

    createThread(forum, title, content) {
        const thread = new Thread(title, content, this);
        forum.addThread(thread);
        this.threads.push(thread);
        return thread;
    }

    postReply(thread, content) {
        const post = new Post(content, this, thread);
        thread.addPost(post);
        this.posts.push(post);
        return post;
    }

    editPost(post, newContent) {
        if (this.posts.includes(post)) {
            post.editContent(newContent);
        } else {
            console.log("Cannot edit this post.");
        }
    }

    deletePost(post, thread) {
        if (this.posts.includes(post)) {
            thread.removePost(post);
            this.posts = this.posts.filter(p => p !== post);
        } else {
            console.log("Cannot delete this post.");
        }
    }

    receiveThreadData(thread) {
        console.log(`Receiving thread data: ${thread.title}`);
    }

    receivePostReplies(thread) {
        console.log(`Receiving post replies for thread: ${thread.title}`);
    }
}
