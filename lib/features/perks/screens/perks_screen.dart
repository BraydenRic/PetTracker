import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme.dart';
import '../../../config/perks_config.dart';
import '../../../features/home/providers/active_pet_provider.dart';
import '../../../features/pets/providers/pets_provider.dart';

class PerksScreen extends ConsumerWidget {
  const PerksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pet = ref.watch(activePetProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Perks & Badges')),
      body: pet == null
          ? const Center(child: Text('No pet selected'))
          : _PerksList(
              petId: pet.id,
              level: pet.level,
              unlockedIds: pet.unlockedPerkIds,
              equippedIds: pet.equippedPerkIds,
            ),
    );
  }
}

class _PerksList extends ConsumerWidget {
  final String petId;
  final int level;
  final List<String> unlockedIds;
  final List<String> equippedIds;

  const _PerksList({
    required this.petId,
    required this.level,
    required this.unlockedIds,
    required this.equippedIds,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accessories = kAccessories;
    final badges = kBadges;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionHeader(title: 'Accessories', subtitle: 'Equip up to 3 at a time'),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.85,
          ),
          itemCount: accessories.length,
          itemBuilder: (context, i) {
            final perk = accessories[i];
            final unlocked = unlockedIds.contains(perk.id);
            final equipped = equippedIds.contains(perk.id);
            return _PerkCard(
              perk: perk,
              unlocked: unlocked,
              equipped: equipped,
              onTap: unlocked
                  ? () => ref.read(petServiceProvider).toggleEquippedPerk(
                        petId,
                        perk.id,
                        equip: !equipped,
                      )
                  : null,
            );
          },
        ),
        const SizedBox(height: 24),
        _SectionHeader(title: 'Badges', subtitle: 'Collected milestones'),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.85,
          ),
          itemCount: badges.length,
          itemBuilder: (context, i) {
            final perk = badges[i];
            final unlocked = unlockedIds.contains(perk.id);
            return _PerkCard(perk: perk, unlocked: unlocked, equipped: false);
          },
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        Text(
          subtitle,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}

class _PerkCard extends StatelessWidget {
  final PerkConfig perk;
  final bool unlocked;
  final bool equipped;
  final VoidCallback? onTap;

  const _PerkCard({
    required this.perk,
    required this.unlocked,
    required this.equipped,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: equipped
              ? AppColors.primary.withAlpha(20)
              : unlocked
                  ? Colors.white
                  : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: equipped
                ? AppColors.primary
                : unlocked
                    ? const Color(0xFFE0E0E0)
                    : Colors.transparent,
            width: equipped ? 2 : 1,
          ),
          boxShadow: unlocked
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(13),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  Text(
                    perk.iconEmoji,
                    style: TextStyle(
                      fontSize: 32,
                      color: unlocked ? null : Colors.grey,
                    ),
                  ),
                  if (!unlocked)
                    const Positioned(
                      bottom: 0,
                      right: 0,
                      child: Icon(Icons.lock, size: 14, color: AppColors.locked),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                perk.displayName,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: unlocked ? AppColors.textPrimary : AppColors.locked,
                ),
              ),
              if (!unlocked)
                Text(
                  'Lv.${perk.unlockLevel}',
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              if (equipped)
                const Text(
                  'Equipped',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
