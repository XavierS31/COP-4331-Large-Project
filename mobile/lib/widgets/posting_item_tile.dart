import 'package:flutter/material.dart';
import '../models/posting.dart';
import '../theme/app_theme.dart';

class PostingItemTile extends StatelessWidget {
  final Posting posting;
  final VoidCallback? onViewApplicants;
  final VoidCallback? onDelete;
  final VoidCallback? onEdit;

  const PostingItemTile({
    super.key,
    required this.posting,
    this.onViewApplicants,
    this.onDelete,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: const BorderRadius.all(AppRadii.xl),
        border: Border.all(color: theme.colorScheme.outlineVariant),
        boxShadow: AppShadows.sm,
      ),
      padding: const EdgeInsets.fromLTRB(16, 16, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHigh,
                  borderRadius: const BorderRadius.all(AppRadii.lg),
                ),
                alignment: Alignment.center,
                child: Icon(
                  Icons.science_outlined,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      posting.title,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${posting.department} • ${posting.requiredMajor}',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Capacity: ${posting.capacity}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (onViewApplicants != null)
                TextButton.icon(
                  onPressed: onViewApplicants,
                  icon: const Icon(Icons.people_outline, size: 18),
                  label: const Text('View Applicants'),
                ),
              if (onEdit != null)
                IconButton(
                  tooltip: 'Edit',
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: onEdit,
                ),
              if (onDelete != null)
                IconButton(
                  tooltip: 'Delete',
                  icon: Icon(
                    Icons.delete_outline,
                    color: theme.colorScheme.error,
                  ),
                  onPressed: onDelete,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
