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
  final Set<String> _updatingIds = {};

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

  Future<void> _updateStatus(
    String applicationId, {
    required String status,
    String nextSteps = '',
  }) async {
    setState(() => _updatingIds.add(applicationId));
    final auth = context.read<AuthProvider>();
    try {
      await ApplicationsService.updateApplicationStatus(
        applicationId,
        auth.authHeaders,
        status: status,
        nextSteps: nextSteps,
      );
      if (!mounted) return;
      setState(() {
        final idx = _applications.indexWhere(
          (a) => a['_id']?.toString() == applicationId,
        );
        if (idx != -1) {
          _applications[idx] = {
            ..._applications[idx],
            'status': status,
            'nextSteps': nextSteps,
          };
        }
        _updatingIds.remove(applicationId);
      });
      Toast.success(
        context,
        status == 'accepted' ? 'Applicant accepted' : 'Applicant declined',
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _updatingIds.remove(applicationId));
      Toast.error(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _confirmDecline(String applicationId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Decline applicant?'),
        content: const Text(
          'Are you sure you want to decline this application? The student will see the updated status.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
            child: const Text('Decline'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _updateStatus(applicationId, status: 'rejected');
    }
  }

  Future<void> _showAcceptDialog(String applicationId) async {
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => const _AcceptDialog(),
    );

    if (result != null) {
      await _updateStatus(
        applicationId,
        status: 'accepted',
        nextSteps: result,
      );
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
                              final app = _applications[index];
                              final id = app['_id']?.toString() ?? '';
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ApplicantCard(
                                  application: app,
                                  isUpdating: _updatingIds.contains(id),
                                  onAccept: id.isEmpty
                                      ? null
                                      : () => _showAcceptDialog(id),
                                  onDecline: id.isEmpty
                                      ? null
                                      : () => _confirmDecline(id),
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

class _AcceptDialog extends StatefulWidget {
  const _AcceptDialog();

  @override
  State<_AcceptDialog> createState() => _AcceptDialogState();
}

class _AcceptDialogState extends State<_AcceptDialog> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Accept applicant'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Provide next steps for the student (e.g., "Email me to set up an interview at...").',
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _controller,
              maxLines: 4,
              minLines: 3,
              maxLength: 500,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Next steps...',
              ),
              validator: (v) {
                if (v == null || v.trim().length < 10) {
                  return 'Please write at least 10 characters';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              Navigator.pop(context, _controller.text.trim());
            }
          },
          child: const Text('Accept'),
        ),
      ],
    );
  }
}

class _ApplicantCard extends StatelessWidget {
  final Map<String, dynamic> application;
  final bool isUpdating;
  final VoidCallback? onAccept;
  final VoidCallback? onDecline;

  const _ApplicantCard({
    required this.application,
    required this.isUpdating,
    required this.onAccept,
    required this.onDecline,
  });

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
    final isPending = status == 'pending';

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
          const SizedBox(height: 12),
          if (isPending)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: isUpdating ? null : onDecline,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(
                        color: Colors.redAccent,
                        width: 1.5,
                      ),
                    ),
                    child: const Text(
                      'Decline',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isUpdating ? null : onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade600,
                      foregroundColor: Colors.white,
                    ),
                    child: isUpdating
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            'Accept',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                  ),
                ),
              ],
            )
          else
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                status == 'accepted' ? 'Accepted' : 'Declined',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: status == 'accepted'
                      ? Colors.green.shade700
                      : theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
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
