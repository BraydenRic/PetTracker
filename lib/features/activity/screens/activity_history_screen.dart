import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../config/activity_config.dart';
import '../../../core/widgets/error_view.dart';
import '../../../features/home/providers/active_pet_provider.dart';
import '../providers/activity_provider.dart';

class ActivityHistoryScreen extends ConsumerWidget {
  const ActivityHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pet = ref.watch(activePetProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Activity Log')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.activityLog),
        icon: const Icon(Icons.add),
        label: const Text('Log Activity'),
      ),
      body: pet == null
          ? const Center(child: Text('No pet selected'))
          : _ActivityList(petId: pet.id, ownerId: pet.ownerId),
    );
  }
}

class _ActivityList extends ConsumerWidget {
  final String petId;
  final String ownerId;

  const _ActivityList({required this.petId, required this.ownerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activitiesAsync = ref.watch(activitiesProvider(petId, ownerId));

    return activitiesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, st) => ErrorView(error: e),
      data: (activities) {
        if (activities.isEmpty) {
          return const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.list_alt, size: 56, color: AppColors.textSecondary),
                SizedBox(height: 16),
                Text(
                  'No activities logged yet.',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          itemCount: activities.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final a = activities[i];
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withAlpha(20),
                  child: Icon(a.type.icon, color: AppColors.primary, size: 20),
                ),
                title: Text(
                  a.type.label,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(_formatDate(a.loggedAt)),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '+${a.xpAwarded} XP',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.xpBar,
                      ),
                    ),
                    if (a.durationMinutes != null)
                      Text(
                        '${a.durationMinutes} min',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    return '${dt.month}/${dt.day}/${dt.year}';
  }
}
