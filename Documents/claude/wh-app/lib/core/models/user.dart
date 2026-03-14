class User {
  final String id;
  final String openid;
  final String name;
  final String avatarUrl;
  final String phone;
  final String hometown;
  final UserPreferences preferences;

  User({
    required this.id,
    required this.openid,
    required this.name,
    required this.avatarUrl,
    required this.phone,
    required this.hometown,
    required this.preferences,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      openid: json['openid'] ?? '',
      name: json['name'] ?? '',
      avatarUrl: json['avatar_url'] ?? '',
      phone: json['phone'] ?? '',
      hometown: json['hometown'] ?? '',
      preferences: UserPreferences.fromJson(json['preferences'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'openid': openid,
      'name': name,
      'avatar_url': avatarUrl,
      'phone': phone,
      'hometown': hometown,
      'preferences': preferences.toJson(),
    };
  }
}

class UserPreferences {
  final String fontSize;
  final String ttsLanguage;
  final double ttsSpeed;

  UserPreferences({
    required this.fontSize,
    required this.ttsLanguage,
    required this.ttsSpeed,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      fontSize: json['font_size'] ?? 'large',
      ttsLanguage: json['tts_language'] ?? 'yue-HK',
      ttsSpeed: (json['tts_speed'] ?? 1.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'font_size': fontSize,
      'tts_language': ttsLanguage,
      'tts_speed': ttsSpeed,
    };
  }
}
