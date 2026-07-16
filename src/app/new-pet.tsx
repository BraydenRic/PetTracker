import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { VectorPet } from '@/components/pet-art';
import { PET_ART } from '@/components/pet-art/pets';
import { Button, Field, FormScroll, Screen, T } from '@/components/ui';
import { MAX_PET_NAME_LENGTH, MAX_PETS, SPECIES, USE_VECTOR_PETS, type SpeciesKey } from '@/config/game';
import { addPet } from '@/lib/actions';
import { useData } from '@/lib/data-context';
import { colors, radius, space } from '@/theme';

export default function NewPetScreen() {
  const router = useRouter();
  const { pets } = useData();
  const [species, setSpecies] = useState<SpeciesKey | null>(null);
  const [coat, setCoat] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!species) return;
    if (!name.trim()) {
      Alert.alert('Almost!', 'Your pet needs a name.');
      return;
    }
    setBusy(true);
    try {
      await addPet(name, species, coat);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Alert.alert('Could not add pet', (err as Error).message);
      setBusy(false);
    }
  };

  const chosen = SPECIES.find((s) => s.key === species);

  // The pack is capped — show a friendly dead end instead of a form that
  // would only fail on submit.
  if (pets.length >= MAX_PETS) {
    return (
      <Screen edges={['top', 'bottom']} style={styles.fullScreen}>
        <Text style={{ fontSize: 64 }}>🏠</Text>
        <T variant="display" style={{ textAlign: 'center' }}>
          Full house!
        </T>
        <T variant="body" style={{ color: colors.sub, textAlign: 'center' }}>
          Your pack is at the limit of {MAX_PETS} pets. To welcome someone new, say goodbye to a
          pet from your Profile first.
        </T>
        <Button title="Got it" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: space(4) }} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
        <T variant="display">Who's joining?</T>
        <T variant="body" style={{ color: colors.sub, marginTop: space(1.5) }}>
          Pick a species, give them a name, and their adventure begins at level 1.
        </T>

        <View style={styles.speciesGrid}>
          {SPECIES.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => {
                Haptics.selectionAsync();
                setSpecies(s.key);
                setCoat(null); // back to the species' default coat
              }}
              style={[styles.speciesCell, species === s.key && styles.speciesCellActive]}>
              <Text style={{ fontSize: 34 }}>{s.emoji}</Text>
              <Text
                style={[styles.speciesLabel, species === s.key && { color: colors.accentDark }]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Coat picker — live previews of each breed palette */}
        {chosen && USE_VECTOR_PETS && (
          <View style={{ marginTop: space(5) }}>
            <T variant="label" style={{ marginBottom: space(2) }}>
              PICK THEIR LOOK
            </T>
            <View style={{ flexDirection: 'row', gap: space(2.5) }}>
              {PET_ART[chosen.key].coats.map((k) => {
                const selected = coat === k.id || (!coat && k.id === PET_ART[chosen.key].coats[0].id);
                return (
                  <Pressable
                    key={k.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCoat(k.id);
                    }}
                    style={[styles.coatCell, selected && styles.speciesCellActive]}>
                    <VectorPet species={chosen.key} coat={k.id} size={62} />
                    <Text style={[styles.speciesLabel, selected && { color: colors.accentDark }]}>
                      {k.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {chosen && (
          <View style={{ gap: space(4), marginTop: space(5) }}>
            <Field
              label={`WHAT'S YOUR ${chosen.label.toUpperCase()}'S NAME?`}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Biscuit"
              autoFocus
              maxLength={MAX_PET_NAME_LENGTH}
            />
            <Button
              title={name.trim() ? `Welcome home, ${name.trim()}! ${chosen.emoji}` : 'Name your pet'}
              onPress={create}
              loading={busy}
              disabled={!name.trim()}
            />
          </View>
        )}

          <Button title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: space(3) }} />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(6),
  },
  fullScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(8),
    gap: space(3),
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2.5),
    marginTop: space(5),
  },
  speciesCell: {
    width: '30.5%',
    flexGrow: 1,
    alignItems: 'center',
    gap: space(1),
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: space(3.5),
  },
  speciesCellActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  coatCell: {
    flex: 1,
    alignItems: 'center',
    gap: space(1),
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: space(3),
  },
  speciesLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.sub,
  },
});
