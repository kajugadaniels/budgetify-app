import 'package:google_sign_in/google_sign_in.dart';

import '../../../../core/config/app_env.dart';

class GoogleIdentityService {
  GoogleIdentityService({GoogleSignIn? googleSignIn})
    : _googleSignIn = googleSignIn ?? GoogleSignIn.instance;

  final GoogleSignIn _googleSignIn;
  bool _isInitialized = false;

  Future<String> getIdToken() async {
    await _ensureInitialized();

    final account = await _googleSignIn.authenticate();
    final idToken = account.authentication.idToken;

    if (idToken == null || idToken.isEmpty) {
      throw StateError(
        'Google sign-in did not return an ID token. Check GOOGLE_SERVER_CLIENT_ID configuration.',
      );
    }

    return idToken;
  }

  Future<void> signOut() async {
    await _ensureInitialized();
    await _googleSignIn.signOut();
  }

  Future<void> _ensureInitialized() async {
    if (_isInitialized) {
      return;
    }

    await _googleSignIn.initialize(
      serverClientId: AppEnv.googleServerClientId,
      clientId: AppEnv.optional('GOOGLE_CLIENT_ID'),
    );
    _isInitialized = true;
  }
}
