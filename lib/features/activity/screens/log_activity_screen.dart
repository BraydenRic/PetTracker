import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../config/activity_config.dart';
import '../../../core/utils/xp_calculator.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/home/providers/active_pet_provider.dart';
import '../providers/activity_provider.dart';

class LogActivityScreen extends ConsumerStatefulWidget {
  final String? preselectedType;

  const LogActivityScreen({super.key, this.preselectedType});

  @override
  ConsumerState<LogActivityScreen> createState() => _LogActivityScreenState();
}

class _LogActivityScreenState extends ConsumerState<LogActivityScreen> {
  late ActivityType _selectedType;
  int _durationMinutes = 20;
  final _notesController = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _selectedType = widget.preselectedType != null
        ? ActivityTypeExt.fromString(widget.preselectedType!)
        : ActivityType.walk;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  int get _previewXp => calculateXpForActivity(
        _selectedType,
        durationMinutes: kActivityConfig[_selectedType]!.hasDuration
            ? _durationMinutes
            : null,
      );

  Future<void> _logActivity() async {
    final pet = ref.read(activePetProvider);
    final user = ref.read(authStateProvider).valueOrNull;
    if (pet == null || user == null) return;

    setState(() => _saving = true);
    try {
      final result = await ref.read(activityServiceProvider).logActivity(
            petId: pet.id,
            ownerId: user.uid,
            type: _selectedType,
            durationMinutes:
                kActivityConfig[_selectedType]!.hasDuration ? _durationMinutes : null,
            notes: _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim(),
          );

      if (!mounted) return;

      // Show level-up dialog if level changed
      if (result.newLevel > result.oldLevel) {
        await _showLevelUpDialog(result.newLevel);
      } else {
        // Show XP toast
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('+${result.xpAwarded} XP! Great job!'),
            backgroundColor: AppColors.xpBar,
            duration: const Duration(seconds: 2),
          ),
        );
      }

      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _showLevelUpDialog(int newLevel) async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 12),
            Text(
              'Level Up!',
              style: Theme.of(ctx).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your pet reached Level $newLevel!',
              textAlign: TextAlign.center,
              style: Theme.of(ctx).textTheme.bodyLarge,
            ),
            const SizedBox(height: 8),
            Text(
              levelTitle(newLevel),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.levelBadge,
              ),
            ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Awesome!'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final config = kActivityConfig[_selectedType]!;

    return Scaffold(
      appBar: AppBar(title: const Text('Log Activity')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Activity type picker
            Text(
              'Activity Type',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ActivityType.values.map((type) {
                final selected = type == _selectedType;
                return ChoiceChip(
                  avatar: Icon(type.icon, size: 18),
                  label: Text(type.label),
                  selected: selected,
                  onSelected: (_) => setState(() => _selectedType = type),
                  selectedColor: AppColors.primary.withAlpha(30),
                  side: BorderSide(
                    color: selected ? AppColors.primary : Colors.transparent,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Duration slider (for walk/play)
            if (config.hasDuration) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Duration',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '$_durationMinutes min',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              Slider(
                value: _durationMinutes.toDouble(),
                min: 5,
                max: 120,
                divisions: 23,
                label: '$_durationMinutes min',
                onChanged: (v) =>
                    setState(() => _durationMinutes = v.round()),
              ),
              const SizedBox(height: 16),
            ],

            // Notes field
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (optional)',
                hintText: 'e.g. Went to the park',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),

            // XP preview
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.xpBar.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.xpBar.withAlpha(60)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.star, color: AppColors.xpBar),
                  const SizedBox(width: 8),
                  Text(
                    'You\'ll earn $_previewXp XP',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.xpBar,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            PrimaryButton(
              label: 'Log Activity',
              onPressed: _logActivity,
              loading: _saving,
              icon: Icons.check,
            ),
          ],
        ),
      ),
    );
  }
}
