import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants.dart';
import '../models/posting.dart';

class SearchService {
  static Future<List<Posting>> getPostings({
    String query = '',
    String department = '',
    String major = '',
  }) async {
    final queryParams = <String, String>{};
    if (query.isNotEmpty) queryParams['q'] = query;
    if (department.isNotEmpty) queryParams['department'] = department;
    if (major.isNotEmpty) queryParams['major'] = major;

    final uri = Uri.parse('${AppConstants.baseUrl}/api/search')
        .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
    
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['postings'] as List<dynamic>)
          .map((e) => Posting.fromJson(e as Map<String, dynamic>))
          .toList();
      return list;
    }
    
    throw Exception('Failed to load postings: ${response.statusCode}');
  }
}
