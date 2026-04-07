class UserModel {
  final String username;
  final String userType; // 'student' or 'faculty'
  final String firstName;
  final String lastName;

  UserModel({
    required this.username,
    required this.userType,
    required this.firstName,
    required this.lastName,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, String userType) {
    return UserModel(
      username: json['username'] ?? '',
      userType: userType,
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
    );
  }
}
