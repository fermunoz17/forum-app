import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

export class PostService {
    // Add post to a thread
    static addPostToThread(threadId, content, authorId) {
        return db.collection('threads').doc(threadId).collection('posts').add({
            content: content,
            authorId: authorId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Delete post from a thread
    static deletePost(threadId, postId) {
        return db.collection('threads').doc(threadId)
            .collection('posts').doc(postId).delete();
    }

    // Fetch all posts for a thread
    static fetchPosts(threadId) {
        return db.collection('threads').doc(threadId)
            .collection('posts').orderBy('createdAt', 'asc').get();
    }
}
