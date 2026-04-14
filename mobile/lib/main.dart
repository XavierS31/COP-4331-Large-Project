import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/student_dashboard_screen.dart';
import 'screens/faculty_dashboard_screen.dart';
import 'screens/card_detail_screen.dart';
import 'screens/faculty_applications_screen.dart';
import 'screens/student_applications_screen.dart';
import 'theme/app_theme.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const ResearchFinderApp(),
    ),
  );
}

class ResearchFinderApp extends StatelessWidget {
  const ResearchFinderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'Research Finder',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (_) => const _AppEntry(),
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/dashboard/student': (_) => const StudentDashboardScreen(),
        '/student-dashboard': (_) => const StudentDashboardScreen(),
        '/dashboard/faculty': (_) => const FacultyDashboardScreen(),
        '/faculty-dashboard': (_) => const FacultyDashboardScreen(), // Fallback
        '/card': (_) => const CardDetailScreen(),
        '/faculty-applications': (_) => const FacultyApplicationsScreen(),
        '/student-applications': (_) => const StudentApplicationsScreen(),
      },
    );
  }
}

// Decides initial route based on persisted session.
class _AppEntry extends StatefulWidget {
  const _AppEntry();
  @override
  State<_AppEntry> createState() => _AppEntryState();
}

class _AppEntryState extends State<_AppEntry> {
  @override
  void initState() {
    super.initState();
    _resolve();
  }

  Future<void> _resolve() async {
    final auth = context.read<AuthProvider>();
    await auth.tryAutoLogin();
    if (!mounted) return;

    if (auth.isAuthenticated) {
      final route = auth.user?.userType == 'faculty'
          ? '/dashboard/faculty'
          : '/dashboard/student';
      Navigator.pushReplacementNamed(context, route);
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
