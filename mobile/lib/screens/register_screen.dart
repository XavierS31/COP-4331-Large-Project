import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../constants.dart';
import '../widgets/branding_panel.dart';
import '../widgets/page_title.dart';
import '../widgets/toast.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _loginCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _majorCtrl = TextEditingController();
  final _collegeCtrl = TextEditingController();
  final _roleCtrl = TextEditingController();
  final _deptCtrl = TextEditingController();
  bool _isStudent = true;
  bool _obscure = true;
  bool _isLoading = false;

  @override
  void dispose() {
    for (final c in [
      _firstCtrl, _lastCtrl, _loginCtrl, _passCtrl,
      _emailCtrl, _majorCtrl, _collegeCtrl, _roleCtrl, _deptCtrl
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _isLoading = true; });

    try {
      http.Response response;
      if (_isStudent) {
        response = await http.post(
          Uri.parse('${AppConstants.baseUrl}/api/signup/student'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'firstName': _firstCtrl.text.trim(),
            'lastName': _lastCtrl.text.trim(),
            'login': _loginCtrl.text.trim(),
            'password': _passCtrl.text,
            'ucfEmail': _emailCtrl.text.trim(),
            'major': _majorCtrl.text.trim(),
            'college': _collegeCtrl.text.trim(),
          }),
        );
      } else {
        response = await http.post(
          Uri.parse('${AppConstants.baseUrl}/api/signup/faculty'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'firstName': _firstCtrl.text.trim(),
            'lastName': _lastCtrl.text.trim(),
            'login': _loginCtrl.text.trim(),
            'password': _passCtrl.text,
            'email': _emailCtrl.text.trim(),
            'role': _roleCtrl.text.trim(),
            'department': _deptCtrl.text.trim(),
          }),
        );
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (!mounted) return;

      if (data['error'] != null && data['error'] != '') {
        Toast.error(context, data['error']);
      } else {
        Toast.success(context, 'Account created! Check your email to verify before logging in.');
      }
    } catch (e) {
      if (mounted) Toast.error(context, 'Network error: $e');
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const BrandingPanel(),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const PageTitle(title: 'Create Account'),
                      const SizedBox(height: 24),
                      SegmentedButton<bool>(
                        segments: const [
                          ButtonSegment<bool>(
                            value: true,
                            label: Text('Student'),
                          ),
                          ButtonSegment<bool>(
                            value: false,
                            label: Text('Faculty'),
                          ),
                        ],
                        selected: <bool>{_isStudent},
                        onSelectionChanged: (newSelection) {
                          setState(() {
                            _isStudent = newSelection.first;
                          });
                        },
                      ),
                      const SizedBox(height: 24),
                      _field(_firstCtrl, 'First Name'),
                      _field(_lastCtrl, 'Last Name'),
                      _field(_loginCtrl, 'Username'),
                      _field(
                        _emailCtrl,
                        _isStudent ? 'UCF Email' : 'Email',
                        keyboard: TextInputType.emailAddress,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: TextFormField(
                          controller: _passCtrl,
                          obscureText: _obscure,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscure ? Icons.visibility_off : Icons.visibility,
                              ),
                              onPressed: () =>
                                  setState(() => _obscure = !_obscure),
                            ),
                          ),
                          validator: (v) => v == null || v.length < 6
                              ? 'Min 6 characters'
                              : null,
                        ),
                      ),
                      if (_isStudent) ...[
                        _field(_majorCtrl, 'Major'),
                        _field(_collegeCtrl, 'College'),
                      ] else ...[
                        _field(_roleCtrl, 'Role / Title'),
                        _field(_deptCtrl, 'Department'),
                      ],
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Register'),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Already have an account? Login'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String label, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboard,
        decoration: InputDecoration(labelText: label),
        validator: (v) =>
            v == null || v.isEmpty ? '$label required' : null,
      ),
    );
  }
}
