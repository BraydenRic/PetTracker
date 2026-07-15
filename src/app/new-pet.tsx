import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, Field, Screen, T } from '@/components/ui';
import { SPECIES, type SpeciesKey } from '@/config/game';
import { addPet } from '@/lib/actions';
import { colors, radius, space } from '@/theme';

export default function NewPetScreen() {
  const router = useRouter();
  const [species, setSpecies] = useState<SpeciesKey | null>(null);
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
      await addPet(name, species);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Alert.alert('Could not add pet', (err as Error).message);
      setBusy(false);
    }
  };

  const chosen = SPECIES.find((s) => s.key === species);

  return (
    <Screen edges={['top', 'bottom']}>
      {/* Modal sheet + keyboard would otherwise cover the name field on smaller phones. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        {chosen && (
          <View style={{ gap: space(4), marginTop: space(5) }}>
            <Field
              label={`WHAT'S YOUR ${chosen.label.toUpperCase()}'S NAME?`}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Biscuit"
              autoFocus
              maxLength={24}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(6),
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
  speciesLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.sub,
  },
});
