import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  String? get token => _token;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null;

  Map<String, String> get authHeaders => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  /// Call on app startup. Restores session from shared_preferences.
  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final storedToken = prefs.getString('auth_token');
    final storedUsername = prefs.getString('auth_username');
    final storedUserType = prefs.getString('auth_userType');
    final storedFirstName = prefs.getString('auth_firstName');
    final storedLastName = prefs.getString('auth_lastName');

    if (storedToken != null &&
        storedUsername != null &&
        storedUserType != null) {
      _token = storedToken;
      _user = UserModel(
        username: storedUsername,
        userType: storedUserType,
        firstName: storedFirstName ?? '',
        lastName: storedLastName ?? '',
      );
      notifyListeners();
    }
  }

  /// POST /api/login
  /// Body: { login, password }
  /// Response: { user, userType, token, error }
  Future<bool> login(String login, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'login': login, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 403) {
        _errorMessage = data['error'] ?? 'Email not verified.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      if (data['token'] == null || data['error'] != '') {
        _errorMessage = data['error'] ?? 'Login failed.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _token = data['token'];
      _user = UserModel.fromJson(data['user'], data['userType']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('auth_username', _user!.username);
      await prefs.setString('auth_userType', _user!.userType);
      await prefs.setString('auth_firstName', _user!.firstName);
      await prefs.setString('auth_lastName', _user!.lastName);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Network error. Is the server running?';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Saves a refreshed token returned by protected endpoints.
  Future<void> refreshToken(String newToken) async {
    _token = newToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', newToken);
    notifyListeners();
  }

  /// Clears all session data.
  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_username');
    await prefs.remove('auth_userType');
    await prefs.remove('auth_firstName');
    await prefs.remove('auth_lastName');
    notifyListeners();
  }
}
