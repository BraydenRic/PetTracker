import 'package:flutter/material.dart';

import '../../../app/theme.dart';
import '../../../config/level_config.dart';
import '../../../core/utils/xp_calculator.dart';

class XpProgressBar extends StatelessWidget {
  final int xp;
  final int level;

  const XpProgressBar({super.key, required this.xp, required this.level});

  @override
  Widget build(BuildContext context) {
    final progress = progressToNextLevel(xp);
    final toNext = xpToNextLevel(xp);
    final title = levelTitle(level);
    final isMaxLevel = level >= kMaxLevel;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.levelBadge,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'Lv.$level $title',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: Colors.white,
                ),
              ),
            ),
            const Spacer(),
            Text(
              isMaxLevel ? 'MAX' : '$toNext XP to next level',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: progress),
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOut,
            builder: (context, value, _) => LinearProgressIndicator(
              value: value,
              minHeight: 12,
              backgroundColor: const Color(0xFFE0E0E0),
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.xpBar),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Total XP: $xp',
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
