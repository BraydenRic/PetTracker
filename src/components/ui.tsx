import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, shadow, space } from '@/theme';

// ---------- Typography ----------

type TVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

const textStyles: Record<TVariant, TextStyle> = {
  display: { fontFamily: fonts.display, fontSize: 34, color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.displaySemi, fontSize: 19, color: colors.ink },
  body: { fontSize: 15.5, color: colors.ink, lineHeight: 22 },
  label: { fontSize: 13.5, fontWeight: '600', color: colors.sub, letterSpacing: 0.2 },
  caption: { fontSize: 12.5, color: colors.faint },
};

export function T({
  variant = 'body',
  style,
  children,
  ...rest
}: { variant?: TVariant; style?: StyleProp<TextStyle> } & React.ComponentProps<typeof Text>) {
  return (
    <Text style={[textStyles[variant], style]} {...rest}>
      {children}
    </Text>
  );
}

// ---------- Layout ----------

export function Screen({
  children,
  style,
  edges = ['top'],
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/**
 * Scroll container for any screen with text inputs. iOS keyboard handling uses
 * the native `automaticallyAdjustKeyboardInsets` (far more reliable than
 * KeyboardAvoidingView); Android resizes the window on its own.
 */
export function FormScroll({
  children,
  contentStyle,
}: {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

// ---------- Buttons ----------

type ButtonVariant = 'primary' | 'ink' | 'outline' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  const bg: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.accent },
    ink: { backgroundColor: colors.ink },
    outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.lineStrong },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.dangerSoft },
  };
  const fg: Record<ButtonVariant, string> = {
    primary: colors.white,
    ink: colors.surface,
    outline: colors.ink,
    ghost: colors.sub,
    danger: colors.danger,
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        bg[variant],
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        isDisabled && { opacity: 0.5 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.buttonInner}>
          {icon}
          <Text style={[styles.buttonText, { color: fg[variant] }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ---------- Inputs ----------

export function Field({
  label,
  error,
  style,
  ...inputProps
}: { label: string; error?: string | null; style?: StyleProp<ViewStyle> } & TextInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={[{ gap: space(1.5) }, style]}>
      <T variant="label">{label}</T>
      <TextInput
        placeholderTextColor={colors.faint}
        style={[
          styles.input,
          focused && { borderColor: colors.accent, backgroundColor: colors.white },
          !!error && { borderColor: colors.danger },
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...inputProps}
      />
      {error ? (
        <T variant="caption" style={{ color: colors.danger }}>
          {error}
        </T>
      ) : null}
    </View>
  );
}

// ---------- Bits ----------

export function CoinPill({ coins, size = 'md' }: { coins: number; size?: 'md' | 'lg' }) {
  return (
    <View style={[styles.coinPill, size === 'lg' && { paddingVertical: space(2) }]}>
      <Text style={{ fontSize: size === 'lg' ? 18 : 14 }}>🪙</Text>
      <Text
        style={{
          fontFamily: fonts.displaySemi,
          fontSize: size === 'lg' ? 18 : 14.5,
          color: colors.ink,
        }}>
        {coins.toLocaleString()}
      </Text>
    </View>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.hr} />;
  return (
    <View style={styles.dividerRow}>
      <View style={styles.hr} />
      <T variant="caption" style={{ marginHorizontal: space(3) }}>
        {label}
      </T>
      <View style={styles.hr} />
    </View>
  );
}

export function EmptyState({
  emoji,
  title,
  message,
}: {
  emoji: string;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <T variant="heading">{title}</T>
      <T variant="body" style={{ color: colors.sub, textAlign: 'center' }}>
        {message}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space(4),
    ...shadow.card,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: space(3.5),
    paddingHorizontal: space(5),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space(4),
    paddingVertical: space(3.25),
    fontSize: 16,
    color: colors.ink,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: '#EAD9A8',
    borderRadius: 999,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
  },
  hr: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: space(2),
  },
  empty: {
    alignItems: 'center',
    gap: space(2.5),
    paddingVertical: space(12),
    paddingHorizontal: space(8),
  },
});
