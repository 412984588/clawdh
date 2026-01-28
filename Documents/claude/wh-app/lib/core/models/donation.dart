class Donation {
  final String id;
  final String orgId;
  final String donorName;
  final double amount;
  final String currency;
  final String purpose;
  final DateTime donationDate;
  final bool isAnonymous;
  final bool showAmount;

  Donation({
    required this.id,
    required this.orgId,
    required this.donorName,
    required this.amount,
    required this.currency,
    required this.purpose,
    required this.donationDate,
    required this.isAnonymous,
    required this.showAmount,
  });

  factory Donation.fromJson(Map<String, dynamic> json) {
    return Donation(
      id: json['_id'] ?? '',
      orgId: json['org_id'] ?? '',
      donorName: json['donor_name'] ?? '善長仁翁',
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      purpose: json['purpose'] ?? '',
      donationDate: DateTime.tryParse(json['donation_date']?.toString() ?? '') ?? DateTime.now(),
      isAnonymous: json['is_anonymous'] ?? false,
      showAmount: json['show_amount'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'org_id': orgId,
      'donor_name': donorName,
      'amount': amount,
      'currency': currency,
      'purpose': purpose,
      'donation_date': donationDate.toIso8601String(),
      'is_anonymous': isAnonymous,
      'show_amount': showAmount,
    };
  }
}
