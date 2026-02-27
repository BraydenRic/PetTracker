import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../app/theme.dart';
import '../../../config/perks_config.dart';

class VirtualPetDisplay extends StatefulWidget {
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
  State<VirtualPetDisplay> createState() => _VirtualPetDisplayState();
}

class _VirtualPetDisplayState extends State<VirtualPetDisplay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _bounceController;
  late final Animation<double> _bounceAnim;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _bounceAnim = Tween<double>(begin: 0, end: -8).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  Widget _buildBreedAvatar() {
    final assetPath = 'assets/avatars/breeds/${widget.breedKey}.svg';
    // Use SvgPicture when assets are available; fallback to placeholder icon.
    return FutureBuilder<bool>(
      future: _assetExists(assetPath),
      builder: (context, snap) {
        if (snap.data == true) {
          return SvgPicture.asset(assetPath, width: 160, height: 160);
        }
        return Container(
          width: 160,
          height: 160,
          decoration: BoxDecoration(
            color: AppColors.primaryLight.withAlpha(40),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.pets, size: 80, color: AppColors.primary),
        );
      },
    );
  }

  Future<bool> _assetExists(String path) async {
    try {
      await DefaultAssetBundle.of(context).load(path);
      return true;
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final accessories = widget.equippedPerkIds
        .map(perkById)
        .whereType<PerkConfig>()
        .where((p) => p.isAccessory && p.assetPath != null)
        .toList();

    return Column(
      children: [
        AnimatedBuilder(
          animation: _bounceAnim,
          builder: (context, child) => Transform.translate(
            offset: Offset(0, _bounceAnim.value),
            child: child,
          ),
          child: SizedBox(
            width: 180,
            height: 180,
            child: Stack(
              alignment: Alignment.center,
              children: [
                _buildBreedAvatar(),
                // Accessory overlays
                for (final acc in accessories)
                  Positioned(
                    top: 0,
                    child: SvgPicture.asset(
                      acc.assetPath!,
                      width: 60,
                      height: 60,
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          widget.petName,
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
