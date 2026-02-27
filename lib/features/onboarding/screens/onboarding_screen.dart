import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/pets/providers/pets_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _step = 0;

  // Onboarding state
  String? _selectedBreedKey;
  final _nameController = TextEditingController();
  DateTime? _birthdate;
  bool _saving = false;

  static const _breeds = [
    ('labrador', 'Labrador'),
    ('golden_retriever', 'Golden Retriever'),
    ('bulldog', 'Bulldog'),
    ('poodle', 'Poodle'),
    ('german_shepherd', 'German Shepherd'),
    ('beagle', 'Beagle'),
    ('husky', 'Husky'),
    ('dachshund', 'Dachshund'),
    ('chihuahua', 'Chihuahua'),
    ('pug', 'Pug'),
    ('corgi', 'Corgi'),
    ('shih_tzu', 'Shih Tzu'),
    ('boxer', 'Boxer'),
    ('border_collie', 'Border Collie'),
    ('rottweiler', 'Rottweiler'),
    ('dalmatian', 'Dalmatian'),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_step < 1) {
      setState(() => _step++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _createPet() async {
    if (_nameController.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final user = ref.read(authStateProvider).valueOrNull;
      if (user == null) return;
      await ref.read(petServiceProvider).createPet(
            ownerId: user.uid,
            name: _nameController.text.trim(),
            breedKey: _selectedBreedKey!,
            birthdate: _birthdate,
          );
      if (mounted) context.go(AppRoutes.home);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_step == 0 ? 'Pick a Breed' : 'Name Your Pet'),
        leading: _step > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  setState(() => _step--);
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 350),
                    curve: Curves.easeInOut,
                  );
                },
              )
            : null,
      ),
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _BreedPickerPage(
            breeds: _breeds,
            selected: _selectedBreedKey,
            onSelected: (key) {
              setState(() => _selectedBreedKey = key);
              _nextStep();
            },
          ),
          _NamePetPage(
            nameController: _nameController,
            birthdate: _birthdate,
            onBirthdateChanged: (d) => setState(() => _birthdate = d),
            onConfirm: _createPet,
            saving: _saving,
            breedKey: _selectedBreedKey,
          ),
        ],
      ),
    );
  }
}

class _BreedPickerPage extends StatelessWidget {
  final List<(String, String)> breeds;
  final String? selected;
  final void Function(String key) onSelected;

  const _BreedPickerPage({
    required this.breeds,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What breed is your dog?',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'This determines your virtual pet\'s avatar.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.2,
              ),
              itemCount: breeds.length,
              itemBuilder: (context, i) {
                final (key, name) = breeds[i];
                final isSelected = selected == key;
                return GestureDetector(
                  onTap: () => onSelected(key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withAlpha(20)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : Colors.transparent,
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(13),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Placeholder icon until SVG assets are added.
                        Icon(
                          Icons.pets,
                          size: 40,
                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          name,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _NamePetPage extends StatelessWidget {
  final TextEditingController nameController;
  final DateTime? birthdate;
  final void Function(DateTime) onBirthdateChanged;
  final VoidCallback onConfirm;
  final bool saving;
  final String? breedKey;

  const _NamePetPage({
    required this.nameController,
    required this.birthdate,
    required this.onBirthdateChanged,
    required this.onConfirm,
    required this.saving,
    required this.breedKey,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'What\'s their name?',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: nameController,
            autofocus: true,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'Pet name'),
          ),
          const SizedBox(height: 24),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Birthday (optional)'),
            subtitle: birthdate != null
                ? Text(
                    '${birthdate!.year}-${birthdate!.month.toString().padLeft(2, '0')}-${birthdate!.day.toString().padLeft(2, '0')}',
                  )
                : const Text('Tap to set'),
            trailing: const Icon(Icons.cake),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.now().subtract(const Duration(days: 365)),
                firstDate: DateTime(2010),
                lastDate: DateTime.now(),
              );
              if (picked != null) onBirthdateChanged(picked);
            },
          ),
          const SizedBox(height: 8),
          Text(
            'Breed cannot be changed after creation.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const Spacer(),
          PrimaryButton(
            label: 'Create My Pet',
            onPressed: nameController.text.trim().isEmpty ? null : onConfirm,
            loading: saving,
            icon: Icons.pets,
          ),
        ],
      ),
    );
  }
}
