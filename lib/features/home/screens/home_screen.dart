import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../config/activity_config.dart';
import '../../../config/perks_config.dart';
import '../../activity/providers/activity_provider.dart';
import '../providers/active_pet_provider.dart';
import '../widgets/quick_log_bar.dart';
import '../widgets/virtual_pet_display.dart';
import '../widgets/xp_progress_bar.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pet = ref.watch(activePetProvider);

    if (pet == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('PetTracker')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.pets, size: 64, color: AppColors.textSecondary),
              const SizedBox(height: 16),
              const Text(
                'No pets yet!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              const Text('Add your first pet to get started.'),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => context.push(AppRoutes.petsNew),
                icon: const Icon(Icons.add),
                label: const Text('Add a Pet'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('PetTracker'),
        actions: [
          IconButton(
            icon: const Icon(Icons.emoji_events),
            tooltip: 'Perks',
            onPressed: () => context.push(AppRoutes.perks),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Virtual pet hero
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                child: VirtualPetDisplay(
                  breedKey: pet.breedKey,
                  equippedPerkIds: pet.equippedPerkIds,
                  petName: pet.name,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // XP / level progress
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: XpProgressBar(xp: pet.xp, level: pet.level),
              ),
            ),
            const SizedBox(height: 16),

            // Quick log buttons
            Text(
              'Log an Activity',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: QuickLogBar(
                  onActivityTap: (type) => context.push(
                    '${AppRoutes.activityLog}?type=${type.firestoreKey}',
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Recently unlocked perks row
            _NewPerksSection(unlockedPerkIds: pet.unlockedPerkIds),
            const SizedBox(height: 16),

            // Recent activity preview
            _RecentActivitySection(petId: pet.id, ownerId: pet.ownerId),
          ],
        ),
      ),
    );
  }
}

class _NewPerksSection extends StatelessWidget {
  final List<String> unlockedPerkIds;

  const _NewPerksSection({required this.unlockedPerkIds});

  @override
  Widget build(BuildContext context) {
    if (unlockedPerkIds.isEmpty) return const SizedBox.shrink();
    final unlocked = unlockedPerkIds
        .map(perkById)
        .whereType<PerkConfig>()
        .take(3)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Perks Earned',
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Row(
          children: unlocked.map((p) {
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                avatar: Text(p.iconEmoji, style: const TextStyle(fontSize: 16)),
                label: Text(p.displayName),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _RecentActivitySection extends ConsumerWidget {
  final String petId;
  final String ownerId;

  const _RecentActivitySection({required this.petId, required this.ownerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activitiesAsync = ref.watch(activitiesProvider(petId, ownerId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            TextButton(
              onPressed: () => context.go(AppRoutes.activity),
              child: const Text('See all'),
            ),
          ],
        ),
        activitiesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('Error: $e'),
          data: (activities) {
            if (activities.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Text(
                    'No activities yet — log one above!',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              );
            }
            return Column(
              children: activities.take(3).map((a) {
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primary.withAlpha(20),
                    child: Icon(a.type.icon, color: AppColors.primary, size: 20),
                  ),
                  title: Text(a.type.label),
                  subtitle: Text(_timeAgo(a.loggedAt)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.xpBar.withAlpha(30),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '+${a.xpAwarded} XP',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.xpBar,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
