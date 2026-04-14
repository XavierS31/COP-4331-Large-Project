import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants.dart';

class ApplicationsService {
  static Future<void> createApplication(
    String postingId,
    Map<String, String> headers, {
    required String message,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/applications/create'),
      headers: headers,
      body: jsonEncode({
        'researchId': postingId,
        'message': message,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || (data['error'] != null && data['error'] != '')) {
      throw Exception(data['error'] ?? 'Failed to apply');
    }
  }

  static Future<List<Map<String, dynamic>>> getApplicationsForPosting(
    String postingId,
    Map<String, String> headers,
  ) async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/api/applications/posting/$postingId'),
      headers: headers,
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || (data['error'] != null && data['error'] != '')) {
      throw Exception(data['error'] ?? 'Failed to load applicants');
    }

    final List<dynamic> raw = data['applications'] ?? [];
    return raw.cast<Map<String, dynamic>>();
  }
}
