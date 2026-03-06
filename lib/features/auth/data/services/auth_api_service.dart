import '../../../../core/network/api_client.dart';
import '../../data/models/auth_session.dart';
import '../../data/models/auth_user.dart';
import '../routes/auth_api_routes.dart';

class AuthApiService {
  AuthApiService({required ApiClient apiClient, required AuthApiRoutes routes})
    : _apiClient = apiClient,
      _routes = routes;

  final ApiClient _apiClient;
  final AuthApiRoutes _routes;

  Future<AuthSession> authenticateWithGoogle(String idToken) async {
    final json = await _apiClient.postJson(
      _routes.google,
      body: <String, dynamic>{'idToken': idToken},
    );

    return AuthSession.fromJson(json);
  }

  Future<AuthSession> refreshSession(String refreshToken) async {
    final json = await _apiClient.postJson(
      _routes.refresh,
      body: <String, dynamic>{'refreshToken': refreshToken},
    );

    return AuthSession.fromJson(json);
  }

  Future<void> logout(String refreshToken) async {
    await _apiClient.postJson(
      _routes.logout,
      body: <String, dynamic>{'refreshToken': refreshToken},
    );
  }

  Future<AuthUser> fetchCurrentUser(String accessToken) async {
    final json = await _apiClient.getJson(
      _routes.me,
      headers: <String, String>{'Authorization': 'Bearer $accessToken'},
    );

    return AuthUser.fromJson(json);
  }
}
