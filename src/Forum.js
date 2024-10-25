class Forum {
    constructor(name) {
        this.name = name;
        this.threads = [];
    }

    addThread(thread) {
        this.threads.push(thread);
    }

    removeThread(thread) {
        this.threads = this.threads.filter(t => t !== thread);
    }

    organizeThreads() {
        console.log(`Organizing threads in forum: ${this.name}`);
    }
}
