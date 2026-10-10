import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final storage = const FlutterSecureStorage();

  Future<void> login(String email, String password) async {
    try {
      final response = await dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      await storage.write(key: 'token', value: response.data['token']);
    } on DioException catch (e) {
      throw Exception('Failed to login: ${e.response?.data ?? e.message}');
    }
  }

  Future<bool> hasToken() async {
    return (await storage.read(key: 'token')) != null;
  }

  Future<void> logout() async {
    await storage.delete(key: 'token');
  }
}
