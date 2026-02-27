import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../config/activity_config.dart';

class QuickLogBar extends StatelessWidget {
  final void Function(ActivityType type) onActivityTap;

  const QuickLogBar({super.key, required this.onActivityTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: ActivityType.values.map((type) {
        return _QuickLogButton(
          type: type,
          onTap: () => onActivityTap(type),
        );
      }).toList(),
    );
  }
}

class _QuickLogButton extends StatelessWidget {
  final ActivityType type;
  final VoidCallback onTap;

  const _QuickLogButton({required this.type, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(18),
              shape: BoxShape.circle,
            ),
            child: Icon(type.icon, color: AppColors.primary, size: 26),
          ),
          const SizedBox(height: 4),
          Text(
            type.label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
