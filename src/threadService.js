import firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize Firestore
const db = firebase.firestore();

export class ThreadService {
    constructor() {
        this.threadsRef = db.collection('threads');
    }

    // Create a new thread
    createThread(title, content, authorId) {
        return this.threadsRef.add({
            title: title,
            content: content,
            authorId: authorId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            posts: [],
            locked: false
        });
    }

    // Fetch all threads
    getThreads() {
        return this.threadsRef.orderBy('createdAt', 'desc').get();
    }

    // Fetch a specific thread
    getThread(threadId) {
        return this.threadsRef.doc(threadId).get();
    }

    // Add a post to a thread
    addPost(threadId, content, authorId) {
        return this.threadsRef.doc(threadId).collection('posts').add({
            content: content,
            authorId: authorId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Fetch all posts in a thread
    getPosts(threadId) {
        return this.threadsRef.doc(threadId).collection('posts')
            .orderBy('createdAt', 'asc').get();
    }
}
