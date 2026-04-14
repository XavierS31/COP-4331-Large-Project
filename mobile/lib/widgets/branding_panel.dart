import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BrandingPanel extends StatelessWidget {
  const BrandingPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      color: theme.colorScheme.surface,
      padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24.0),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/KnightLabLogo.png',
              height: 96,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 16),
            Text.rich(
              TextSpan(
                children: [
                  TextSpan(
                    text: 'Knight',
                    style: GoogleFonts.manrope(
                      color: theme.colorScheme.onSurface,
                      fontSize: 34,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  TextSpan(
                    text: ' Lab',
                    style: GoogleFonts.manrope(
                      color: theme.colorScheme.primary,
                      fontSize: 34,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'UCF Research Portal',
              style: theme.textTheme.bodyMedium?.copyWith(
                letterSpacing: 2.0,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
