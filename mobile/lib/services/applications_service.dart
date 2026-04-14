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

  static Future<List<Map<String, dynamic>>> getMyApplications(
    Map<String, String> headers,
  ) async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/api/applications/mine'),
      headers: headers,
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || (data['error'] != null && data['error'] != '')) {
      throw Exception(data['error'] ?? 'Failed to load your applications');
    }

    final List<dynamic> raw = data['applications'] ?? [];
    return raw.cast<Map<String, dynamic>>();
  }

  static Future<Map<String, dynamic>> updateApplicationStatus(
    String applicationId,
    Map<String, String> headers, {
    required String status,
    String nextSteps = '',
  }) async {
    final response = await http.put(
      Uri.parse('${AppConstants.baseUrl}/api/applications/$applicationId/status'),
      headers: headers,
      body: jsonEncode({
        'status': status,
        'nextSteps': nextSteps,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || (data['error'] != null && data['error'] != '')) {
      throw Exception(data['error'] ?? 'Failed to update application');
    }

    return (data['application'] as Map?)?.cast<String, dynamic>() ?? {};
  }

  static Future<void> withdrawApplication(
    String applicationId,
    Map<String, String> headers,
  ) async {
    final response = await http.delete(
      Uri.parse('${AppConstants.baseUrl}/api/applications/$applicationId'),
      headers: headers,
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || (data['error'] != null && data['error'] != '')) {
      throw Exception(data['error'] ?? 'Failed to withdraw application');
    }
  }
}
