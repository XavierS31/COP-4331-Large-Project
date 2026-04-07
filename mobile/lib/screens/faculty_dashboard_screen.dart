import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../models/posting.dart';
import '../constants.dart';

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
      backgroundColor: const Color(0xFF1A1A1A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        title: const Text('Faculty Dashboard', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF000000),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFC909)))
          : _postings.isEmpty
              ? const Center(child: Text('No postings found.', style: TextStyle(color: Colors.white70)))
              : ListView.builder(
                  itemCount: _postings.length,
                  itemBuilder: (context, index) {
                    final posting = _postings[index];
                    return Card(
                      color: const Color(0xFF1A1A1A),
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        title: Text(
                          posting.title,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            '${posting.department} - ${posting.requiredMajor}\nCapacity: ${posting.capacity}',
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ),
                        isThreeLine: true,
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.redAccent),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                backgroundColor: const Color(0xFF1A1A1A),
                                title: const Text('Delete Posting', style: TextStyle(color: Colors.white)),
                                content: const Text('Are you sure you want to delete this posting?', style: TextStyle(color: Colors.white70)),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(ctx);
                                      _deletePosting(posting.id);
                                    },
                                    child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFFFC909),
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add, color: Colors.black),
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
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
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
                  backgroundColor: const Color(0xFFFFC909),
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
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                    : const Text('Submit', style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
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
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.white24),
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Color(0xFFFFC909)),
          borderRadius: BorderRadius.circular(8),
        ),
        errorBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.redAccent),
          borderRadius: BorderRadius.circular(8),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.redAccent),
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
    );
  }
}
