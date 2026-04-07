class Posting {
  final String id;
  final String title;
  final String department;
  final String description;
  final String requiredMajor;
  final int applicantCount;
  final int capacity;
  final String facultyUsername;

  Posting({
    required this.id,
    required this.title,
    required this.department,
    required this.description,
    required this.requiredMajor,
    required this.applicantCount,
    required this.capacity,
    required this.facultyUsername,
  });

  factory Posting.fromJson(Map<String, dynamic> json) {
    return Posting(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      department: json['department'] ?? '',
      description: json['description'] ?? '',
      requiredMajor: json['requiredMajor'] ?? '',
      applicantCount: json['applicantCount'] is int ? json['applicantCount'] : int.tryParse(json['applicantCount']?.toString() ?? '') ?? 0,
      capacity: json['capacity'] is int ? json['capacity'] : int.tryParse(json['capacity']?.toString() ?? '') ?? 0,
      facultyUsername: json['facultyUsername'] ?? '',
    );
  }
}
