import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppShadows {
  static const sm = [
    BoxShadow(offset: Offset(0, 1), blurRadius: 2, color: Color(0x0D000000)),
  ];
  static const lg = [
    BoxShadow(offset: Offset(0, 10), blurRadius: 15, spreadRadius: -3, color: Color(0x1A000000)),
    BoxShadow(offset: Offset(0, 4), blurRadius: 6, spreadRadius: -4, color: Color(0x1A000000)),
  ];
  static const xl = [
    BoxShadow(offset: Offset(0, 20), blurRadius: 25, spreadRadius: -5, color: Color(0x1A000000)),
    BoxShadow(offset: Offset(0, 8), blurRadius: 10, spreadRadius: -6, color: Color(0x1A000000)),
  ];
  static const xxl = [
    BoxShadow(offset: Offset(0, 25), blurRadius: 50, spreadRadius: -12, color: Color(0x40000000)),
  ];
  static const postingItemHover = [
    BoxShadow(offset: Offset(0, 20), blurRadius: 40, color: Color(0x0A1A1C1B)),
  ];
}

class AppRadii {
  static const sm   = Radius.circular(2);
  static const md   = Radius.circular(6);
  static const lg   = Radius.circular(4);
  static const xl   = Radius.circular(8);
  static const full = Radius.circular(999);
}

class AppSpacing {
  static const x1 = 4.0;    // p-1
  static const x2 = 8.0;    // p-2
  static const x3 = 12.0;   // p-3
  static const x4 = 16.0;   // p-4
  static const x6 = 24.0;   // p-6
  static const x8 = 32.0;   // p-8
  static const x12 = 48.0;  // p-12
  static const x16 = 64.0;  // h-16 (top nav height)
  static const sidebarWidth = 256.0; // w-64
}

class AppTheme {
  // Brand Colors
  static const Color background = Color(0xFFF9F9F7);
  static const Color surface = Color(0xFFF9F9F7);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainerLow = Color(0xFFF4F4F2);
  static const Color surfaceContainer = Color(0xFFEEEEEC);
  static const Color surfaceContainerHigh = Color(0xFFE8E8E6);
  static const Color surfaceContainerHighest = Color(0xFFE2E3E1);
  
  static const Color primary = Color(0xFF755B00);
  static const Color primaryContainer = Color(0xFFFFC909);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryFixed = Color(0xFF241A00);
  static const Color onPrimaryContainer = Color(0xFF6E5500);
  
  static const Color primaryFixed = Color(0xFFFFDF91);
  static const Color primaryFixedDim = Color(0xFFF4C000);
  
  static const Color onSurface = Color(0xFF1A1C1B);
  static const Color onSurfaceVariant = Color(0xFF4E4632);
  static const Color inverseSurface = Color(0xFF1A1C1B);
  
  static const Color secondary = Color(0xFF5E5E5E);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color secondaryContainer = Color(0xFFE2E2E2);
  static const Color onSecondaryContainer = Color(0xFF646464);
  static const Color outline = Color(0xFF80765F);
  static const Color outlineVariant = Color(0xFFD2C5AB);
  static const Color error = Color(0xFFBA1A1A);

  // Gradients
  static const LinearGradient academicGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1A1C1B), Color(0xFF2F3130)],
  );

  static const LinearGradient goldGradientBtn = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF755B00), Color(0xFFFFC909)],
  );

  static ThemeData get lightTheme {
    final textTheme = TextTheme(
      displayLarge: GoogleFonts.manrope(fontWeight: FontWeight.w800, color: onSurface),
      headlineLarge: GoogleFonts.manrope(fontWeight: FontWeight.w800, color: onSurface),
      headlineMedium: GoogleFonts.manrope(fontWeight: FontWeight.w700, color: onSurface),
      titleLarge: GoogleFonts.manrope(fontWeight: FontWeight.w700, color: onSurface),
      bodyLarge: GoogleFonts.publicSans(fontWeight: FontWeight.w400, color: onSurface),
      bodyMedium: GoogleFonts.publicSans(fontWeight: FontWeight.w400, color: onSurfaceVariant),
      labelLarge: GoogleFonts.publicSans(fontWeight: FontWeight.w700, color: onSurface),
      labelSmall: GoogleFonts.publicSans(fontWeight: FontWeight.w700, letterSpacing: 1.2, color: onSurface),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: surface,
      colorScheme: ColorScheme.light(
        primary: primary,
        onPrimary: onPrimary,
        primaryContainer: primaryContainer,
        onPrimaryContainer: onPrimaryContainer,
        secondary: secondary,
        onSecondary: onSecondary,
        secondaryContainer: secondaryContainer,
        onSecondaryContainer: onSecondaryContainer,
        surface: surface,
        onSurface: onSurface,
        error: error,
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceContainerLowest,
        foregroundColor: onSurface,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: onSurface),
        titleTextStyle: GoogleFonts.manrope(
          color: onSurface,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceContainerLowest,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadii.xl),
          side: BorderSide(color: outlineVariant), // soft borders
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryContainer,
          foregroundColor: onPrimaryFixed,
          textStyle: GoogleFonts.publicSans(
            fontWeight: FontWeight.w700,
            fontSize: 15,
          ),
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 24),
          elevation: 1, // shadowSm equivalent
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(AppRadii.xl), // Match xl CTA toggle segment pattern
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: GoogleFonts.publicSans(fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceContainerLowest,
        labelStyle: TextStyle(color: onSurfaceVariant),
        hintStyle: TextStyle(color: onSurfaceVariant.withOpacity(0.6)),
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        border: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadii.lg),
          borderSide: BorderSide(color: outline),
        ),
        enabledBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadii.lg),
          borderSide: BorderSide(color: outlineVariant),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadii.lg),
          borderSide: BorderSide(color: primary, width: 2),
        ),
        errorBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadii.lg),
          borderSide: BorderSide(color: error),
        ),
        focusedErrorBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadii.lg),
          borderSide: BorderSide(color: error, width: 2),
        ),
      ),
      textTheme: textTheme,
      dialogTheme: const DialogThemeData(
        backgroundColor: surfaceContainerLowest,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadii.xl)),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceContainerLowest,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: AppRadii.xl),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: primary),
    );
  }
}
