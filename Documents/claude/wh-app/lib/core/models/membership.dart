import 'org.dart';

class Membership {
  final String id;
  final String openid;
  final String orgId;
  final String status; // pending, active, rejected, removed
  final String role; // member, admin
  final Org? organization;

  Membership({
    required this.id,
    required this.openid,
    required this.orgId,
    required this.status,
    required this.role,
    this.organization,
  });

  factory Membership.fromJson(Map<String, dynamic> json) {
    return Membership(
      id: json['_id'] ?? '',
      openid: json['openid'] ?? '',
      orgId: json['org_id'] ?? '',
      status: json['status'] ?? 'pending',
      role: json['role'] ?? 'member',
      organization: json['organization'] != null ? Org.fromJson(json['organization']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'openid': openid,
      'org_id': orgId,
      'status': status,
      'role': role,
      if (organization != null) 'organization': organization!.toJson(),
    };
  }
}
