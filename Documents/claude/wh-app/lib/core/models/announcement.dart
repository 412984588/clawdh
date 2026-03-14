class Announcement {
  final String id;
  final String orgId;
  final String title;
  final String type;
  final String content;
  final bool isPinned;
  final String visibility;
  final DateTime createdAt;

  Announcement({
    required this.id,
    required this.orgId,
    required this.title,
    required this.type,
    required this.content,
    required this.isPinned,
    required this.visibility,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['_id'] ?? '',
      orgId: json['org_id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'notice',
      content: json['content'] ?? '',
      isPinned: json['is_pinned'] ?? false,
      visibility: json['visibility'] ?? 'members_only',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'org_id': orgId,
      'title': title,
      'type': type,
      'content': content,
      'is_pinned': isPinned,
      'visibility': visibility,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
