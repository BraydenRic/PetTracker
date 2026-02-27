import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../config/breeds_config.dart';
import '../../../core/utils/xp_calculator.dart';
import '../../../core/widgets/error_view.dart';
import '../../../features/pets/providers/pets_provider.dart';

class PetDetailScreen extends ConsumerWidget {
  final String petId;

  const PetDetailScreen({super.key, required this.petId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final petsAsync = ref.watch(petsProvider);

    return petsAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: ErrorView(error: e)),
      data: (pets) {
        final pet = pets.where((p) => p.id == petId).firstOrNull;
        if (pet == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Pet not found')),
          );
        }
        final breed = breedByKey(pet.breedKey);
        return Scaffold(
          appBar: AppBar(
            title: Text(pet.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () => context.push('/pets/$petId/edit'),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Avatar
              Center(
                child: CircleAvatar(
                  radius: 56,
                  backgroundColor: AppColors.primary.withAlpha(20),
                  child: const Icon(Icons.pets, size: 56, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  pet.name,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Center(
                child: Text(
                  breed?.displayName ?? pet.breedKey,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ),
              const SizedBox(height: 24),

              // Stats grid
              Row(
                children: [
                  _StatCard(label: 'Level', value: '${pet.level}'),
                  const SizedBox(width: 12),
                  _StatCard(label: 'Total XP', value: '${pet.xp}'),
                  const SizedBox(width: 12),
                  _StatCard(label: 'Activities', value: '${pet.totalActivities}'),
                ],
              ),
              const SizedBox(height: 16),
              _StatCard(
                label: 'XP to Next Level',
                value: pet.level >= 50
                    ? 'MAX LEVEL'
                    : '${xpToNextLevel(pet.xp)} XP',
                wide: true,
              ),
              const SizedBox(height: 16),

              if (pet.birthdate != null) ...[
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.cake, color: AppColors.primary),
                  title: const Text('Birthday'),
                  subtitle: Text(
                    '${pet.birthdate!.year}-${pet.birthdate!.month.toString().padLeft(2, '0')}-${pet.birthdate!.day.toString().padLeft(2, '0')}',
                  ),
                ),
              ],
              const SizedBox(height: 8),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.emoji_events, color: AppColors.levelBadge),
                title: const Text('Perks Unlocked'),
                subtitle: Text('${pet.unlockedPerkIds.length} of ${12} perks'),
                trailing: TextButton(
                  onPressed: () => context.push('/profile/perks'),
                  child: const Text('View All'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final bool wide;

  const _StatCard({
    required this.label,
    required this.value,
    this.wide = false,
  });

  @override
  Widget build(BuildContext context) {
    final card = Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
    return wide ? card : Expanded(child: card);
  }
}
