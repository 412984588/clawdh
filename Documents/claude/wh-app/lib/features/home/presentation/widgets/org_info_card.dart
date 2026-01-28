import 'package:flutter/material.dart';
import 'package:wh_app/core/models/org.dart';

class OrgInfoCard extends StatelessWidget {
  final Org org;

  const OrgInfoCard({super.key, required this.org});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (org.logo.isNotEmpty)
                  CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage(org.logo),
                  )
                else
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    child: Icon(Icons.business, size: 30, color: Theme.of(context).primaryColor),
                  ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    org.name,
                    style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              org.description,
              style: const TextStyle(fontSize: 20, color: Colors.black87),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
