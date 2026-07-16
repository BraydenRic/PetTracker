import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AccessoryPreview } from '@/components/pet-art';
import { ACCESSORY_ART } from '@/components/pet-art/accessories';
import { CoinPill, Screen, T } from '@/components/ui';
import { USE_VECTOR_PETS } from '@/config/game';
import {
  ACCESSORY_SLOTS,
  SHOP_ITEMS,
  type AccessoryItem,
  type BackdropItem,
  type ShopItem,
} from '@/config/shop';
import { buyItem, equipAccessory, equipBackdrop } from '@/lib/actions';
import { useData } from '@/lib/data-context';
import { colors, fonts, radius, shadow, space } from '@/theme';

type ItemState = 'locked' | 'owned' | 'equipped';

function ItemCard({
  item,
  state,
  affordable,
  onPress,
}: {
  item: ShopItem;
  state: ItemState;
  affordable: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.itemCard,
        state === 'equipped' && styles.itemEquipped,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}>
      {item.kind === 'backdrop' ? (
        <View style={styles.backdropPreview}>
          <LinearGradient colors={(item as BackdropItem).colors} style={StyleSheet.absoluteFill} />
          <Text style={{ fontSize: 24 }}>{(item as BackdropItem).decor}</Text>
        </View>
      ) : USE_VECTOR_PETS && ACCESSORY_ART[item.id] ? (
        // Preview the exact vector art the pet will wear, not the lookalike emoji.
        <AccessoryPreview itemId={item.id} size={46} />
      ) : (
        <Text style={{ fontSize: 38 }}>{(item as AccessoryItem).emoji}</Text>
      )}
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      {state === 'locked' ? (
        <View style={[styles.priceTag, !affordable && { opacity: 0.45 }]}>
          <Text style={styles.priceText}>🪙 {item.price}</Text>
        </View>
      ) : (
        <View style={[styles.priceTag, styles.ownedTag, state === 'equipped' && styles.equippedTag]}>
          <Text style={[styles.priceText, state === 'equipped' && { color: colors.white }]}>
            {state === 'equipped' ? '✓ Equipped' : 'Equip'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ShopScreen() {
  const { profile, activePet } = useData();
  const [busy, setBusy] = useState(false);
  const coins = profile?.coins ?? 0;
  // Each pet has its own wardrobe — the shop always operates on the active pet.
  const owned = activePet?.ownedItemIds ?? [];

  const stateFor = (item: ShopItem): ItemState => {
    if (!owned.includes(item.id)) return 'locked';
    if (!activePet) return 'owned';
    const equipped =
      item.kind === 'backdrop'
        ? activePet.backdropId === item.id
        : activePet.equipped?.[(item as AccessoryItem).slot] === item.id;
    return equipped ? 'equipped' : 'owned';
  };

  const onItemPress = async (item: ShopItem) => {
    if (busy) return;
    const state = stateFor(item);

    if (state === 'locked') {
      if (!activePet) {
        Alert.alert('No active pet', 'Add a pet first — items are bought for a specific pet.');
        return;
      }
      if (coins < item.price) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Not enough coins',
          `You need 🪙 ${item.price - coins} more. Log activities and keep streaks to earn coins!`,
        );
        return;
      }
      Alert.alert(`Buy ${item.name} for ${activePet.name}?`, `This will cost 🪙 ${item.price}.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            setBusy(true);
            try {
              await buyItem(activePet, item.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              Alert.alert('Purchase failed', (err as Error).message);
            } finally {
              setBusy(false);
            }
          },
        },
      ]);
      return;
    }

    if (!activePet) {
      Alert.alert('No active pet', 'Add a pet first, then dress them up.');
      return;
    }

    // Toggle equip/unequip on the active pet.
    setBusy(true);
    try {
      Haptics.selectionAsync();
      if (item.kind === 'backdrop') {
        await equipBackdrop(activePet.id, state === 'equipped' ? null : item.id);
      } else {
        const acc = item as AccessoryItem;
        await equipAccessory(activePet.id, acc.slot, state === 'equipped' ? null : acc.id);
      }
    } catch (err) {
      Alert.alert('Could not equip', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sections: { title: string; items: ShopItem[] }[] = [
    ...ACCESSORY_SLOTS.map(({ slot, label }) => ({
      title: label,
      items: SHOP_ITEMS.filter((i) => i.kind === 'accessory' && i.slot === slot),
    })),
    { title: 'Backdrops', items: SHOP_ITEMS.filter((i) => i.kind === 'backdrop') },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <T variant="title">Treat Shop</T>
          <CoinPill coins={coins} size="lg" />
        </View>
        <T variant="caption" style={{ marginBottom: space(2) }}>
          {activePet
            ? `Shopping for ${activePet.name} — every pet has their own collection.`
            : 'Add a pet to start dressing them up.'}
        </T>

        {sections.map((section) => (
          <View key={section.title}>
            <T variant="heading" style={styles.sectionTitle}>
              {section.title}
            </T>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  state={stateFor(item)}
                  affordable={coins >= item.price}
                  onPress={() => onItemPress(item)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(5),
    paddingBottom: space(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space(2),
  },
  sectionTitle: {
    marginTop: space(5),
    marginBottom: space(3),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2.5),
  },
  itemCard: {
    width: '30.5%',
    flexGrow: 1,
    maxWidth: '32%',
    alignItems: 'center',
    gap: space(2),
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: space(3.5),
    paddingHorizontal: space(2),
    ...shadow.card,
  },
  itemEquipped: {
    borderColor: colors.accent,
  },
  backdropPreview: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  priceTag: {
    backgroundColor: colors.goldSoft,
    borderRadius: 999,
    paddingHorizontal: space(2.5),
    paddingVertical: space(1),
  },
  ownedTag: {
    backgroundColor: colors.sageSoft,
  },
  equippedTag: {
    backgroundColor: colors.sage,
  },
  priceText: {
    fontSize: 11.5,
    fontFamily: fonts.displaySemi,
    color: colors.ink,
  },
});
