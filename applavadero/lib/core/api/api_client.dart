import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../auth/token_storage.dart';
import 'api_endpoints.dart';

class ApiException implements Exception {
  final String mensaje;
  final int statusCode;
  ApiException(this.mensaje, this.statusCode);

  @override
  String toString() => mensaje;
}

class ApiClient {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  final VoidCallback? onUnauthorized;

  ApiClient(this._tokenStorage, {this.onUnauthorized})
      : _dio = Dio(BaseOptions(
          baseUrl: kBaseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          contentType: 'application/json',
        )) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.read();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode ?? 0;

          if (statusCode == 401) {
            await _tokenStorage.delete();
            onUnauthorized?.call();
          }

          final raw = error.response?.data?['message'];
          final message = raw is List
              ? raw.first.toString()
              : raw?.toString() ??
                  error.error?.toString() ??
                  error.message ??
                  'Error de conexión';
          debugPrint('[ApiClient] Error $statusCode: ${error.type}');
          handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              error: ApiException(message, statusCode),
            ),
          );
        },
      ),
    );
  }

  Future<dynamic> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    try {
      final res = await _dio.get(path, queryParameters: queryParameters);
      return res.data;
    } on DioException catch (e) {
      throw e.error ?? ApiException('Error de conexión', 0);
    }
  }

  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final res = await _dio.post(path, data: data);
      return res.data;
    } on DioException catch (e) {
      throw e.error ?? ApiException('Error de conexión', 0);
    }
  }

  Future<dynamic> patch(String path, {dynamic data}) async {
    try {
      final res = await _dio.patch(path, data: data);
      return res.data;
    } on DioException catch (e) {
      throw e.error ?? ApiException('Error de conexión', 0);
    }
  }

  Future<dynamic> delete(String path) async {
    try {
      final res = await _dio.delete(path);
      return res.data;
    } on DioException catch (e) {
      throw e.error ?? ApiException('Error de conexión', 0);
    }
  }
}
