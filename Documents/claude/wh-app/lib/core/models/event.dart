class Event {
  final String id;
  final String orgId;
  final String title;
  final String type;
  final String coverImage;
  final String content;
  final DateTime eventDate;
  final String venueName;
  final String address;
  final String status;
  final String visibility;

  Event({
    required this.id,
    required this.orgId,
    required this.title,
    required this.type,
    required this.coverImage,
    required this.content,
    required this.eventDate,
    required this.venueName,
    required this.address,
    required this.status,
    required this.visibility,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['_id'] ?? '',
      orgId: json['org_id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? '',
      coverImage: json['cover_image'] ?? '',
      content: json['content'] ?? '',
      eventDate: DateTime.tryParse(json['event_date']?.toString() ?? '') ?? DateTime.now(),
      venueName: json['venue_name'] ?? '',
      address: json['address'] ?? '',
      status: json['status'] ?? 'upcoming',
      visibility: json['visibility'] ?? 'members_only',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'org_id': orgId,
      'title': title,
      'type': type,
      'cover_image': coverImage,
      'content': content,
      'event_date': eventDate.toIso8601String(),
      'venue_name': venueName,
      'address': address,
      'status': status,
      'visibility': visibility,
    };
  }
}
