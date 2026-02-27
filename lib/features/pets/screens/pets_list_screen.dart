import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../core/widgets/error_view.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/home/providers/active_pet_provider.dart';
import '../../../features/pets/providers/pets_provider.dart';
import '../../../models/pet_model.dart';

class PetsListScreen extends ConsumerWidget {
  const PetsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final petsAsync = ref.watch(petsProvider);
    final activePetId = ref.watch(activePetIdProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: const Text('My Pets')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.petsNew),
        icon: const Icon(Icons.add),
        label: const Text('Add Pet'),
      ),
      body: petsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e),
        data: (pets) {
          if (pets.isEmpty) {
            return Center(
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
                  const Text('Tap + to add your first pet.'),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
            itemCount: pets.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) => _PetCard(
              pet: pets[i],
              isActive: pets[i].id == activePetId,
            ),
          );
        },
      ),
    );
  }
}

class _PetCard extends ConsumerWidget {
  final PetModel pet;
  final bool isActive;

  const _PetCard({required this.pet, required this.isActive});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isActive ? AppColors.primary : Colors.transparent,
          width: 2,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/pets/${pet.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.primary.withAlpha(20),
                child: const Icon(Icons.pets, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          pet.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        if (isActive) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Active',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Level ${pet.level} · ${pet.xp} XP',
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              if (!isActive)
                TextButton(
                  onPressed: () async {
                    final user = ref.read(authStateProvider).valueOrNull;
                    if (user == null) return;
                    await ref.read(petServiceProvider).setActivePet(user.uid, pet.id);
                  },
                  child: const Text('Select'),
                ),
              const Icon(Icons.chevron_right, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
