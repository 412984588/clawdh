class Org {
  final String id;
  final String name;
  final String logo;
  final String description;
  final int memberCount;

  Org({
    required this.id,
    required this.name,
    required this.logo,
    required this.description,
    required this.memberCount,
  });

  factory Org.fromJson(Map<String, dynamic> json) {
    return Org(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      logo: json['logo'] ?? '',
      description: json['description'] ?? '',
      memberCount: json['member_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'logo': logo,
      'description': description,
      'member_count': memberCount,
    };
  }
}
