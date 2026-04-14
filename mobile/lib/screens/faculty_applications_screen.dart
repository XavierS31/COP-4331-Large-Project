import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/posting.dart';
import '../providers/auth_provider.dart';
import '../services/applications_service.dart';
import '../theme/app_theme.dart';
import '../widgets/toast.dart';

class FacultyApplicationsScreen extends StatefulWidget {
  const FacultyApplicationsScreen({super.key});

  @override
  State<FacultyApplicationsScreen> createState() =>
      _FacultyApplicationsScreenState();
}

class _FacultyApplicationsScreenState extends State<FacultyApplicationsScreen> {
  List<Map<String, dynamic>> _applications = [];
  bool _isLoading = true;
  Posting? _posting;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    _posting = ModalRoute.of(context)!.settings.arguments as Posting;
    _fetch();
  }

  Future<void> _fetch() async {
    if (_posting == null) return;
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    try {
      final results = await ApplicationsService.getApplicationsForPosting(
        _posting!.id,
        auth.authHeaders,
      );
      if (!mounted) return;
      setState(() {
        _applications = results;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      Toast.error(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Applicants'),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_posting != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Applicants for',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.primary,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _posting!.title,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_applications.length} applicant${_applications.length == 1 ? '' : 's'}',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            Expanded(
              child: _isLoading
                  ? _buildLoadingList(theme)
                  : _applications.isEmpty
                      ? Center(
                          child: Text(
                            'No applicants yet.',
                            style: theme.textTheme.bodyLarge,
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetch,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            itemCount: _applications.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ApplicantCard(
                                  application: _applications[index],
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingList(ThemeData theme) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: 4,
      itemBuilder: (ctx, i) => Container(
        height: 140,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerLow,
          borderRadius: const BorderRadius.all(AppRadii.xl),
          border: Border.all(color: theme.colorScheme.outlineVariant),
        ),
      ),
    );
  }
}

class _ApplicantCard extends StatelessWidget {
  final Map<String, dynamic> application;
  const _ApplicantCard({required this.application});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final student = application['student'] as Map<String, dynamic>?;
    final firstName = student?['firstName'] ?? '';
    final lastName = student?['lastName'] ?? '';
    final email = student?['ucfEmail'] ?? student?['username'] ?? 'Unknown';
    final major = student?['major'] ?? '';
    final message = (application['message'] ?? '').toString();
    final appliedAt = (application['appliedAt'] ?? '').toString();
    final status = (application['status'] ?? 'pending').toString();

    final fullName = '$firstName $lastName'.trim();
    final initials = _initialsOf(firstName, lastName, email);

    return Container(
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: const BorderRadius.all(AppRadii.xl),
        border: Border.all(color: theme.colorScheme.outlineVariant),
        boxShadow: AppShadows.sm,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: const BorderRadius.all(AppRadii.full),
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName.isEmpty ? 'Unknown Student' : fullName,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      email,
                      style: theme.textTheme.bodyMedium,
                    ),
                    if (major.toString().isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        major,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              _StatusChip(status: status),
            ],
          ),
          if (message.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerLow,
                borderRadius: const BorderRadius.all(AppRadii.lg),
                border: Border.all(color: theme.colorScheme.outlineVariant),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'MESSAGE',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    message,
                    style: theme.textTheme.bodyLarge?.copyWith(height: 1.4),
                  ),
                ],
              ),
            ),
          ],
          if (appliedAt.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Applied $appliedAt',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _initialsOf(String first, String last, String fallback) {
    final f = first.isNotEmpty ? first[0] : '';
    final l = last.isNotEmpty ? last[0] : '';
    final combined = (f + l).toUpperCase();
    if (combined.isNotEmpty) return combined;
    return fallback.isNotEmpty ? fallback[0].toUpperCase() : '?';
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: const BorderRadius.all(AppRadii.full),
      ),
      child: Text(
        status.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSecondaryContainer,
          fontSize: 10,
        ),
      ),
    );
  }
}
