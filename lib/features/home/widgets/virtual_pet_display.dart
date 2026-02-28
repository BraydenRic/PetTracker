import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../../../app/theme.dart';
import '../../../config/breeds_config.dart';
import '../../../config/perks_config.dart';

class VirtualPetDisplay extends StatelessWidget {
  final String breedKey;
  final List<String> equippedPerkIds;
  final String petName;

  const VirtualPetDisplay({
    super.key,
    required this.breedKey,
    required this.equippedPerkIds,
    required this.petName,
  });

  @override
  Widget build(BuildContext context) {
    final accessories = equippedPerkIds
        .map(perkById)
        .whereType<PerkConfig>()
        .where((p) => p.isAccessory)
        .toList();

    return Column(
      children: [
        SizedBox(
          height: 220,
          child: Lottie.network(
            kIdleDogLottieUrl,
            fit: BoxFit.contain,
            repeat: true,
            animate: true,
            frameBuilder: (context, child, composition) {
              if (composition == null) {
                return const Center(child: CircularProgressIndicator());
              }
              return child;
            },
            errorBuilder: (context, error, stack) => const _FallbackIcon(),
          ),
        ),

        // Equipped accessories as emoji strip under the animation
        if (accessories.isNotEmpty) ...[
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: accessories
                .map(
                  (a) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      a.iconEmoji,
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                )
                .toList(),
          ),
        ],

        const SizedBox(height: 8),
        Text(
          petName,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _FallbackIcon extends StatefulWidget {
  const _FallbackIcon();

  @override
  State<_FallbackIcon> createState() => _FallbackIconState();
}

class _FallbackIconState extends State<_FallbackIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0, end: -10).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _anim,
        builder: (context, child) =>
            Transform.translate(offset: Offset(0, _anim.value), child: child),
        child: Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            gradient: RadialGradient(
              colors: [
                AppColors.primary.withAlpha(50),
                AppColors.primary.withAlpha(10),
              ],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withAlpha(70),
                blurRadius: 32,
                spreadRadius: 6,
              ),
            ],
          ),
          child: const Icon(Icons.pets, size: 72, color: AppColors.primary),
        ),
      ),
    );
  }
}
