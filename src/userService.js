import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Initialize Firestore
const db = firebase.firestore();

export class UserService {
    constructor() {
        this.usersRef = db.collection('users');
    }

    // Create a new user profile in Firestore after sign-up
    createUserProfile(uid, email, role = 'user') {
        return this.usersRef.doc(uid).set({
            email: email,
            role: role,
            threads: [],
            posts: []
        });
    }

    // Fetch user profile
    getUserProfile(uid) {
        return this.usersRef.doc(uid).get();
    }

    // Update user role (Admin, Moderator, etc.)
    updateUserRole(uid, newRole) {
        return this.usersRef.doc(uid).update({ role: newRole });
    }
}
