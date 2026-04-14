import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../models/posting.dart';
import '../constants.dart';
import '../widgets/app_drawers.dart';
import '../widgets/posting_item_tile.dart';
import '../widgets/top_nav_bar.dart';

class FacultyDashboardScreen extends StatefulWidget {
  const FacultyDashboardScreen({super.key});

  @override
  State<FacultyDashboardScreen> createState() => _FacultyDashboardScreenState();
}

class _FacultyDashboardScreenState extends State<FacultyDashboardScreen> {
  List<Posting> _postings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchPostings();
  }

  Future<void> _fetchPostings() async {
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/postings/mine'),
        headers: auth.authHeaders,
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (data['token'] != null) {
          auth.refreshToken(data['token']);
        }
        final List<dynamic> postingsJson = data['postings'] ?? [];
        setState(() {
          _postings = postingsJson.map((json) => Posting.fromJson(json)).toList();
        });
      }
    } catch (e) {
      // Handle error
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _deletePosting(String id) async {
    final auth = context.read<AuthProvider>();
    try {
      final response = await http.delete(
        Uri.parse('${AppConstants.baseUrl}/api/postings/$id'),
        headers: auth.authHeaders,
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (data['token'] != null) {
          auth.refreshToken(data['token']);
        }
        _fetchPostings();
      }
    } catch (e) {
      // Handle error
    }
  }

  void _showCreateDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _CreatePostingForm(
        onSubmit: (newPostingMap) async {
          final auth = context.read<AuthProvider>();
          try {
            final response = await http.post(
              Uri.parse('${AppConstants.baseUrl}/api/postings'),
              headers: auth.authHeaders,
              body: jsonEncode(newPostingMap),
            );
            final data = jsonDecode(response.body);
            if (response.statusCode == 200) {
              if (data['token'] != null) {
                auth.refreshToken(data['token']);
              }
              _fetchPostings();
              if (context.mounted) {
                Navigator.pop(context);
              }
            }
          } catch (e) {
            // Handle error
          }
        },
      ),
    );
  }

  void _confirmDelete(Posting posting) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Posting'),
        content: const Text('Are you sure you want to delete this posting?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _deletePosting(posting.id);
            },
            child: Text(
              'Delete',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: const TopNavBar(),
      drawer: const FacultyDrawer(),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Research Postings',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_postings.length} active ${_postings.length == 1 ? 'posting' : 'postings'}',
                  style: theme.textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _postings.isEmpty
                    ? const Center(child: Text('No postings found.'))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        itemCount: _postings.length,
                        itemBuilder: (context, index) {
                          final posting = _postings[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: PostingItemTile(
                              posting: posting,
                              onViewApplicants: () => Navigator.pushNamed(
                                context,
                                '/faculty-applications',
                                arguments: posting,
                              ),
                              onDelete: () => _confirmDelete(posting),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _CreatePostingForm extends StatefulWidget {
  final Function(Map<String, dynamic>) onSubmit;

  const _CreatePostingForm({required this.onSubmit});

  @override
  State<_CreatePostingForm> createState() => _CreatePostingFormState();
}

class _CreatePostingFormState extends State<_CreatePostingForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _requiredMajorController = TextEditingController();
  final _capacityController = TextEditingController();
  final _departmentController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _requiredMajorController.dispose();
    _capacityController.dispose();
    _departmentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Create Posting',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              _buildTextField('Title', _titleController),
              const SizedBox(height: 12),
              _buildTextField('Description', _descriptionController, maxLines: 3),
              const SizedBox(height: 12),
              _buildTextField('Required Major', _requiredMajorController),
              const SizedBox(height: 12),
              _buildTextField('Capacity', _capacityController, keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _buildTextField('Department', _departmentController),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _isSubmitting
                    ? null
                    : () async {
                        if (_formKey.currentState!.validate()) {
                          setState(() => _isSubmitting = true);
                          await widget.onSubmit({
                            'title': _titleController.text,
                            'description': _descriptionController.text,
                            'requiredMajor': _requiredMajorController.text,
                            'capacity': int.tryParse(_capacityController.text) ?? 0,
                            'department': _departmentController.text,
                          });
                          if (mounted) setState(() => _isSubmitting = false);
                        }
                      },
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Submit'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {int maxLines = 1, TextInputType? keyboardType}) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label),
      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
    );
  }
}
