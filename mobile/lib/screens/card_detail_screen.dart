import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/posting.dart';
import '../providers/auth_provider.dart';
import '../services/applications_service.dart';
import '../theme/app_theme.dart';
import '../widgets/toast.dart';

class CardDetailScreen extends StatelessWidget {
  const CardDetailScreen({super.key});

  Future<void> _showApplyModal(BuildContext context, Posting posting) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => _ApplyMessageSheet(posting: posting),
    );
  }

  @override
  Widget build(BuildContext context) {
    final posting = ModalRoute.of(context)!.settings.arguments as Posting;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Posting Details'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      posting.title,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Department: ${posting.department}',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Required Major: ${posting.requiredMajor}',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Capacity: ${posting.applicantCount} / ${posting.capacity}',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Description',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      posting.description,
                      style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                boxShadow: AppShadows.lg,
              ),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => _showApplyModal(context, posting),
                  child: const Text(
                    'Apply Now',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ApplyMessageSheet extends StatefulWidget {
  final Posting posting;
  const _ApplyMessageSheet({required this.posting});

  @override
  State<_ApplyMessageSheet> createState() => _ApplyMessageSheetState();
}

class _ApplyMessageSheetState extends State<_ApplyMessageSheet> {
  final _messageCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final auth = context.read<AuthProvider>();
    try {
      await ApplicationsService.createApplication(
        widget.posting.id,
        auth.authHeaders,
        message: _messageCtrl.text.trim(),
      );
      if (!mounted) return;
      Toast.success(context, 'Application submitted!');
      Navigator.pop(context); // close sheet
      Navigator.pop(context); // return to list
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      Toast.error(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final viewInsets = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: viewInsets + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Apply to',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.primary,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.posting.title,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 20),
            Text(
              'Write a brief message to the faculty member explaining why you are a good fit for this research opportunity.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _messageCtrl,
              maxLines: 6,
              minLines: 4,
              maxLength: 1000,
              textInputAction: TextInputAction.newline,
              decoration: const InputDecoration(
                hintText: 'I am interested in this position because...',
                alignLabelWithHint: true,
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) {
                  return 'Please write a brief message';
                }
                if (v.trim().length < 20) {
                  return 'Please write at least 20 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      )
                    : const Text(
                        'Submit Application',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
