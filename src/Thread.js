class Thread {
    constructor(title, content, author) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.posts = [];
        this.locked = false;
    }

    addPost(post) {
        if (!this.locked) {
            this.posts.push(post);
        } else {
            console.log("Cannot add post, thread is locked.");
        }
    }

    removePost(post) {
        this.posts = this.posts.filter(p => p !== post);
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    receiveUserData(user) {
        console.log(`Received data from user: ${user.username}`);
    }
}

class Post {
    constructor(content, author, thread) {
        this.content = content;
        this.author = author;
        this.thread = thread;
    }

    editContent(newContent) {
        this.content = newContent;
    }

    receiveThreadContext() {
        console.log(`This post belongs to thread: ${this.thread.title}`);
    }
}
