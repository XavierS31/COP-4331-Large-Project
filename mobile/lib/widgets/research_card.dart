import 'package:flutter/material.dart';
import '../models/posting.dart';
import '../theme/app_theme.dart';

class ResearchCard extends StatelessWidget {
  final Posting posting;
  final bool isFeatured;

  const ResearchCard.standard({super.key, required this.posting})
      : isFeatured = false;

  const ResearchCard.featured({super.key, required this.posting})
      : isFeatured = true;

  @override
  Widget build(BuildContext context) {
    Widget cardContent = Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: const BorderRadius.all(AppRadii.xl),
        border: Border.all(
          color: isFeatured ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.outlineVariant,
          width: isFeatured ? 2.0 : 1.0,
        ),
        boxShadow: isFeatured ? AppShadows.postingItemHover : AppShadows.sm,
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            posting.title,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Department: ${posting.department}',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 4),
          Text(
            'Required Major: ${posting.requiredMajor}',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/card', arguments: posting);
              },
              child: const Text('Apply Now'),
            ),
          ),
        ],
      ),
    );

    return cardContent;
  }
}
