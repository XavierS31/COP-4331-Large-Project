import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../constants.dart';
import '../models/posting.dart';
import '../providers/auth_provider.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});
  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  final _searchCtrl = TextEditingController();
  List<Posting> _postings = [];
  bool _isLoading = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchPostings();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchPostings({String query = ''}) async {
    setState(() { _isLoading = true; _error = ''; });

    try {
      final uri = Uri.parse('${AppConstants.baseUrl}/api/search').replace(
        queryParameters: query.isNotEmpty ? {'q': query} : {},
      );
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final list = (data['postings'] as List<dynamic>)
            .map((e) => Posting.fromJson(e as Map<String, dynamic>))
            .toList();
        setState(() { _postings = list; });
      } else {
        setState(() { _error = 'Server error ${response.statusCode}'; });
      }
    } catch (e) {
      setState(() { _error = 'Network error: $e'; });
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  void _onSearchSubmit() {
    _fetchPostings(query: _searchCtrl.text.trim());
  }

  void _clearSearch() {
    _searchCtrl.clear();
    _fetchPostings();
  }

  Future<void> _applyToPosting(Posting posting) async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) return;

    final statementCtrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a1a),
        title: Text(
          'Apply: ${posting.title}',
          style: const TextStyle(color: Color(0xFFffc909)),
        ),
        content: TextField(
          controller: statementCtrl,
          maxLines: 4,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Write your statement of interest...',
            hintStyle: TextStyle(color: Colors.white38),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel',
                style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;
    final statement = statementCtrl.text.trim();
    if (statement.isEmpty) return;

    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/applications/create'),
        headers: auth.authHeaders,
        body: jsonEncode({
          'researchId': posting.id,
          'statement': statement,
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['token'] != null) {
        await auth.refreshToken(data['token'] as String);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            data['error'] != null && data['error'] != ''
                ? data['error']
                : 'Application submitted!',
          ),
          backgroundColor: data['error'] != null && data['error'] != ''
              ? Colors.redAccent
              : const Color(0xFFffc909),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Network error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Research Finder'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Header greeting ──────────────────────────────
          Container(
            width: double.infinity,
            color: const Color(0xFF111111),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Text(
              'Welcome, ${auth.user?.firstName ?? 'Student'}',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 15,
              ),
            ),
          ),

          // ── Search bar ───────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _searchCtrl,
                    onFieldSubmitted: (_) => _onSearchSubmit(),
                    decoration: InputDecoration(
                      hintText: 'Search by title or description...',
                      prefixIcon: const Icon(Icons.search,
                          color: Color(0xFFffc909)),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear,
                                  color: Colors.white54),
                              onPressed: _clearSearch,
                            )
                          : null,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _onSearchSubmit,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(48, 48),
                    padding: EdgeInsets.zero,
                  ),
                  child: const Icon(Icons.search, color: Colors.black),
                ),
              ],
            ),
          ),

          // ── Results count ────────────────────────────────
          if (!_isLoading && _error.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${_postings.length} posting${_postings.length == 1 ? '' : 's'} found',
                  style: const TextStyle(color: Colors.white38, fontSize: 13),
                ),
              ),
            ),

          // ── Body ─────────────────────────────────────────
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFffc909),
                    ),
                  )
                : _error.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_error,
                                style: const TextStyle(
                                    color: Colors.redAccent)),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => _fetchPostings(),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _postings.isEmpty
                        ? const Center(
                            child: Text(
                              'No postings found.',
                              style: TextStyle(color: Colors.white54),
                            ),
                          )
                        : RefreshIndicator(
                            color: const Color(0xFFffc909),
                            onRefresh: () =>
                                _fetchPostings(
                                  query: _searchCtrl.text.trim()),
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _postings.length,
                              separatorBuilder: (_, index) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (_, i) =>
                                  _PostingCard(
                                    posting: _postings[i],
                                    onApply: () =>
                                        _applyToPosting(_postings[i]),
                                  ),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}

// ── Posting card widget ──────────────────────────────────────────────────────
class _PostingCard extends StatelessWidget {
  final Posting posting;
  final VoidCallback onApply;

  const _PostingCard({required this.posting, required this.onApply});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a1a),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF2a2a2a)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title + badge row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  posting.title,
                  style: const TextStyle(
                    color: Color(0xFFffc909),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF2a2a2a),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  posting.department,
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Description
          Text(
            posting.description,
            style: const TextStyle(color: Colors.white70, height: 1.5),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),

          // Meta row
          Wrap(
            spacing: 16,
            runSpacing: 4,
            children: [
              _meta(Icons.school, 'Major: ${posting.requiredMajor}'),
              _meta(Icons.people,
                  '${posting.applicantCount}/${posting.capacity} applicants'),
              _meta(Icons.person, posting.facultyUsername),
            ],
          ),
          const SizedBox(height: 16),

          // Apply button
          SizedBox(
            width: double.infinity,
            height: 40,
            child: ElevatedButton(
              onPressed: onApply,
              child: const Text('Apply',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.white38),
        const SizedBox(width: 4),
        Text(text,
            style:
                const TextStyle(color: Colors.white38, fontSize: 12)),
      ],
    );
  }
}
