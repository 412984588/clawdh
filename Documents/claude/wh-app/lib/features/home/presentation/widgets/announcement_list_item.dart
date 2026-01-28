import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wh_app/core/models/announcement.dart';

class AnnouncementListItem extends StatelessWidget {
  final Announcement announcement;
  final VoidCallback onTap;

  const AnnouncementListItem({super.key, required this.announcement, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      title: Row(
        children: [
          if (announcement.isPinned)
            Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: Icon(Icons.push_pin, size: 20, color: Theme.of(context).primaryColor),
            ),
          Expanded(
            child: Text(
              announcement.title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(
          DateFormat('yyyy-MM-dd').format(announcement.createdAt),
          style: const TextStyle(fontSize: 18, color: Colors.black54),
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 30),
      onTap: onTap,
    );
  }
}
