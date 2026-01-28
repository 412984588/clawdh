import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class ApiResponse<T> {
  final int code;
  final T? data;
  final String message;

  ApiResponse({required this.code, this.data, required this.message});

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromDataJson) {
    return ApiResponse(
      code: json['code'] ?? -1,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromDataJson(json['data']) : null,
    );
  }

  bool get isSuccess => code == 0;
}

class ApiClient {
  final Dio _dio = Dio();
  String _accessToken = '';

  ApiClient() {
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    // 添加攔截器處理 Common Headers 或 Logging
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          responseBody: true,
          requestBody: true,
          requestHeader: false, // 不打印 header（可能含 Token）
        ),
      );
    }
  }

  // 設置 Access Token
  void setAccessToken(String token) {
    _accessToken = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  // 清除 Access Token
  void clearAccessToken() {
    _accessToken = '';
    _dio.options.headers.remove('Authorization');
  }

  String get accessToken => _accessToken;

  Future<ApiResponse<T>> get<T>(
    String url, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic) fromDataJson,
  }) async {
    try {
      final response = await _dio.get(url, queryParameters: queryParameters);
      return ApiResponse.fromJson(response.data, fromDataJson);
    } on DioException catch (e) {
      return ApiResponse(
        code: -1,
        message: e.message ?? '網絡錯誤',
        data: null,
      );
    }
  }

  Future<ApiResponse<T>> post<T>(
    String url, {
    Map<String, dynamic>? data,
    required T Function(dynamic) fromDataJson,
  }) async {
    try {
      final response = await _dio.post(url, data: data);
      return ApiResponse.fromJson(response.data, fromDataJson);
    } on DioException catch (e) {
      return ApiResponse(
        code: -1,
        message: e.message ?? '網絡錯誤',
        data: null,
      );
    }
  }

  Future<ApiResponse<T>> put<T>(
    String url, {
    Map<String, dynamic>? data,
    required T Function(dynamic) fromDataJson,
  }) async {
    try {
      final response = await _dio.put(url, data: data);
      return ApiResponse.fromJson(response.data, fromDataJson);
    } on DioException catch (e) {
      return ApiResponse(
        code: -1,
        message: e.message ?? '網絡錯誤',
        data: null,
      );
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String url, {
    Map<String, dynamic>? data,
    required T Function(dynamic) fromDataJson,
  }) async {
    try {
      final response = await _dio.delete(url, data: data);
      return ApiResponse.fromJson(response.data, fromDataJson);
    } on DioException catch (e) {
      return ApiResponse(
        code: -1,
        message: e.message ?? '網絡錯誤',
        data: null,
      );
    }
  }
}
