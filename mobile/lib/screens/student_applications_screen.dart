import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/applications_service.dart';
import '../theme/app_theme.dart';
import '../widgets/toast.dart';

class StudentApplicationsScreen extends StatefulWidget {
  const StudentApplicationsScreen({super.key});

  @override
  State<StudentApplicationsScreen> createState() =>
      _StudentApplicationsScreenState();
}

class _StudentApplicationsScreenState extends State<StudentApplicationsScreen> {
  List<Map<String, dynamic>> _applications = [];
  bool _isLoading = true;
  final Set<String> _withdrawingIds = {};

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    try {
      final results = await ApplicationsService.getMyApplications(
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

  Future<void> _withdraw(String applicationId) async {
    setState(() => _withdrawingIds.add(applicationId));
    final auth = context.read<AuthProvider>();
    try {
      await ApplicationsService.withdrawApplication(
        applicationId,
        auth.authHeaders,
      );
      if (!mounted) return;
      setState(() {
        _applications.removeWhere((a) => a['_id']?.toString() == applicationId);
        _withdrawingIds.remove(applicationId);
      });
      Toast.success(context, 'Application withdrawn');
    } catch (e) {
      if (!mounted) return;
      setState(() => _withdrawingIds.remove(applicationId));
      Toast.error(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your submissions',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'My Applications',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_applications.length} application${_applications.length == 1 ? '' : 's'}',
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
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Text(
                              'You haven\'t applied to any postings yet.',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyLarge,
                            ),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetch,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            itemCount: _applications.length,
                            itemBuilder: (context, index) {
                              final app = _applications[index];
                              final id = app['_id']?.toString() ?? '';
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ApplicationCard(
                                  application: app,
                                  isWithdrawing: _withdrawingIds.contains(id),
                                  onWithdraw: id.isEmpty
                                      ? null
                                      : () => _withdraw(id),
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
        height: 160,
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

class _ApplicationCard extends StatelessWidget {
  final Map<String, dynamic> application;
  final bool isWithdrawing;
  final VoidCallback? onWithdraw;

  const _ApplicationCard({
    required this.application,
    required this.isWithdrawing,
    required this.onWithdraw,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final posting = application['posting'] as Map<String, dynamic>?;
    final title = (posting?['title'] ?? 'Unknown Posting').toString();
    final department = (posting?['department'] ?? '').toString();
    final requiredMajor = (posting?['requiredMajor'] ?? '').toString();
    final message = (application['message'] ?? '').toString();
    final appliedAt = (application['appliedAt'] ?? '').toString();
    final status = (application['status'] ?? 'pending').toString();
    final nextSteps = (application['nextSteps'] ?? '').toString();
    final isPending = status == 'pending';
    final isAccepted = status == 'accepted';

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
              Expanded(
                child: Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _SemanticStatusChip(status: status),
            ],
          ),
          if (department.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              department,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          if (requiredMajor.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              'Major: $requiredMajor',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          if (message.isNotEmpty) ...[
            const SizedBox(height: 12),
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
                    'YOUR MESSAGE',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    message,
                    style: theme.textTheme.bodyMedium?.copyWith(height: 1.4),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
          if (isAccepted && nextSteps.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: const BorderRadius.all(AppRadii.lg),
                border: Border.all(color: Colors.green.shade300, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 18,
                        color: Colors.green.shade700,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'NEXT STEPS FROM FACULTY',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    nextSteps,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      height: 1.4,
                      color: Colors.green.shade900,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              if (appliedAt.isNotEmpty)
                Expanded(
                  child: Text(
                    'Applied $appliedAt',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                )
              else
                const Spacer(),
              if (isPending)
                OutlinedButton(
                  onPressed: isWithdrawing ? null : onWithdraw,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: theme.colorScheme.error,
                    side: BorderSide(
                      color: theme.colorScheme.error,
                      width: 1.5,
                    ),
                  ),
                  child: isWithdrawing
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.5),
                        )
                      : const Text(
                          'Withdraw',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SemanticStatusChip extends StatelessWidget {
  final String status;
  const _SemanticStatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Color bg;
    Color fg;
    if (status == 'accepted') {
      bg = Colors.green.shade100;
      fg = Colors.green.shade800;
    } else if (status == 'rejected') {
      bg = theme.colorScheme.surfaceContainerHighest;
      fg = theme.colorScheme.onSurfaceVariant;
    } else {
      bg = theme.colorScheme.secondaryContainer;
      fg = theme.colorScheme.onSecondaryContainer;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.all(AppRadii.full),
      ),
      child: Text(
        status.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: fg,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
