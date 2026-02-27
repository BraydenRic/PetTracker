import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';

import '../core/constants/firestore_paths.dart';
import '../models/user_model.dart';

class AuthService {
  final _auth = FirebaseAuth.instance;
  final _firestore = FirebaseFirestore.instance;
  final _googleSignIn = GoogleSignIn();

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<UserModel> signInWithGoogle() async {
    late UserCredential userCredential;

    if (kIsWeb) {
      // On web, use Firebase's built-in popup flow
      final provider = GoogleAuthProvider();
      userCredential = await _auth.signInWithPopup(provider);
    } else {
      // On mobile, use the google_sign_in package
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw Exception('Google sign-in cancelled');

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      userCredential = await _auth.signInWithCredential(credential);
    }

    return _getOrCreateUserDoc(userCredential.user!);
  }

  Future<void> signOut() async {
    if (kIsWeb) {
      await _auth.signOut();
    } else {
      await Future.wait([_auth.signOut(), _googleSignIn.signOut()]);
    }
  }

  Future<UserModel> _getOrCreateUserDoc(User firebaseUser) async {
    final ref = _firestore.doc(FirestorePaths.user(firebaseUser.uid));
    final snap = await ref.get();
    if (snap.exists) return UserModel.fromFirestore(snap);
    return _createUserDoc(firebaseUser);
  }

  Future<UserModel> _createUserDoc(User firebaseUser) async {
    final user = UserModel(
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName ?? '',
      photoUrl: firebaseUser.photoURL,
      createdAt: DateTime.now(),
    );
    await _firestore
        .doc(FirestorePaths.user(firebaseUser.uid))
        .set(user.toFirestore());
    return user;
  }
}
