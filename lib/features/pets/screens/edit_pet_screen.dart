import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/primary_button.dart';
import '../providers/pets_provider.dart';

class EditPetScreen extends ConsumerStatefulWidget {
  final String petId;

  const EditPetScreen({super.key, required this.petId});

  @override
  ConsumerState<EditPetScreen> createState() => _EditPetScreenState();
}

class _EditPetScreenState extends ConsumerState<EditPetScreen> {
  final _nameController = TextEditingController();
  DateTime? _birthdate;
  bool _loaded = false;
  bool _saving = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final petsAsync = ref.watch(petsProvider);

    return petsAsync.when(
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(appBar: AppBar(), body: Text('$e')),
      data: (pets) {
        final pet = pets.where((p) => p.id == widget.petId).firstOrNull;
        if (pet == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Pet not found')),
          );
        }
        // Initialize fields once
        if (!_loaded) {
          _nameController.text = pet.name;
          _birthdate = pet.birthdate;
          _loaded = true;
        }

        return Scaffold(
          appBar: AppBar(title: const Text('Edit Pet')),
          body: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Pet name'),
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Birthday (optional)'),
                  subtitle: _birthdate != null
                      ? Text(
                          '${_birthdate!.year}-${_birthdate!.month.toString().padLeft(2, '0')}-${_birthdate!.day.toString().padLeft(2, '0')}',
                        )
                      : const Text('Not set'),
                  trailing: const Icon(Icons.cake),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _birthdate ??
                          DateTime.now().subtract(const Duration(days: 365)),
                      firstDate: DateTime(2010),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) setState(() => _birthdate = picked);
                  },
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Save Changes',
                  loading: _saving,
                  onPressed: () async {
                    if (_nameController.text.trim().isEmpty) return;
                    setState(() => _saving = true);
                    final nav = Navigator.of(context);
                    try {
                      await ref.read(petServiceProvider).updatePet(
                            widget.petId,
                            name: _nameController.text.trim(),
                            birthdate: _birthdate,
                          );
                      nav.pop();
                    } finally {
                      if (mounted) setState(() => _saving = false);
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
