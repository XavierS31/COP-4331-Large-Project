import 'dart:async';
import 'package:flutter/material.dart';
import '../models/posting.dart';
import '../services/search_service.dart';
import '../widgets/app_drawers.dart';
import '../widgets/research_card.dart';
import '../widgets/top_nav_bar.dart';
import '../theme/app_theme.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;
  
  List<Posting> _postings = [];
  bool _isLoading = true;
  String _departmentFilter = '';
  String _majorFilter = '';

  @override
  void initState() {
    super.initState();
    _fetchData();
    _searchCtrl.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      _fetchData();
    });
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final results = await SearchService.getPostings(
        query: _searchCtrl.text.trim(),
        department: _departmentFilter,
        major: _majorFilter,
      );
      if (mounted) {
        setState(() {
          _postings = results;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _postings = [];
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: const TopNavBar(),
      drawer: const StudentDrawer(),
      endDrawer: Drawer(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Filters', style: theme.textTheme.headlineMedium),
                const SizedBox(height: 24),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Department'),
                  initialValue: _departmentFilter,
                  onChanged: (v) => _departmentFilter = v,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Required Major'),
                  initialValue: _majorFilter,
                  onChanged: (v) => _majorFilter = v,
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _fetchData();
                  },
                  child: const Text('Apply Filters'),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _departmentFilter = '';
                      _majorFilter = '';
                    });
                    Navigator.pop(context);
                    _fetchData();
                  },
                  child: const Text('Clear Filters'),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _searchCtrl,
                    decoration: InputDecoration(
                      hintText: 'Search postings...',
                      prefixIcon: Icon(Icons.search, color: theme.colorScheme.primary),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: const BorderRadius.all(AppRadii.xl),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Builder(
                    builder: (ctx) => IconButton(
                      icon: const Icon(Icons.filter_list),
                      color: theme.colorScheme.primary,
                      onPressed: () => Scaffold.of(ctx).openEndDrawer(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: 4,
                    itemBuilder: (ctx, i) => Container(
                      height: 120,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface.withOpacity(0.5),
                        borderRadius: const BorderRadius.all(AppRadii.xl),
                      ),
                    ),
                  )
                : _postings.isEmpty
                    ? Center(
                        child: Text(
                          'No postings found matching your criteria.',
                          style: theme.textTheme.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
                        itemCount: _postings.length,
                        itemBuilder: (ctx, index) {
                          final posting = _postings[index];
                          final isFeatured = index == 0;
                          
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: GestureDetector(
                              onTap: () => Navigator.pushNamed(context, '/card', arguments: posting),
                              child: isFeatured
                                  ? ResearchCard.featured(posting: posting)
                                  : ResearchCard.standard(posting: posting),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
