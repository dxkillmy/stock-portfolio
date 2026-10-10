   import 'package:dio/dio.dart';
   import 'package:flutter_secure_storage/flutter_secure_storage.dart';
   import '../config.dart';

   const _storage = FlutterSecureStorage();

   final Dio dio = Dio(BaseOptions(
     baseUrl: baseUrl,
     connectTimeout: const Duration(seconds: 10),
     receiveTimeout: const Duration(seconds: 10),
   ))
     ..interceptors.add(InterceptorsWrapper(
       onRequest: (options, handler) async {
         final token = await _storage.read(key: 'token');
         if (token != null) {
           options.headers['Authorization'] = 'Bearer $token';
         }
         handler.next(options);
       },
     ));