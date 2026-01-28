import 'package:flutter/material.dart';

class AppTheme {
  // 适老化设计标准：中国红高对比度
  static const primaryColor = Color(0xFFD32F2F);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        onPrimary: Colors.white,
        surface: Colors.white,
        onSurface: Color(0xFF212121), // 高对比度黑
      ),

      // 适老化字体配置
      textTheme: const TextTheme(
        // 标题 24pt
        titleLarge: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Color(0xFF212121),
        ),
        // 正文 20pt
        bodyLarge: TextStyle(
          fontSize: 20,
          color: Color(0xFF212121),
        ),
        bodyMedium: TextStyle(
          fontSize: 18,
          color: Color(0xFF212121),
        ),
      ),

      // 按钮适老化
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(88, 56),
          textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        centerTitle: true,
        titleTextStyle: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
