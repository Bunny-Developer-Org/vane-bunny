import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../../src/components/Logo';
import { LANGUAGES, useI18n, type LanguageCode } from '../../src/i18n';
import { useTheme, radii, spacing, type Palette } from '../../src/theme';
import type { Palette as PaletteType } from '../../src/theme/palettes';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { palette, palettes, setPaletteId } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const styles = createStyles(palette);
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
    >
      <View style={styles.header}>
        <Logo size={18} />
      </View>

      <Text style={styles.title}>{t('settings.title')}</Text>

      <Text style={styles.sectionLabel}>{t('settings.appearance')}</Text>
      <View style={styles.paletteRow}>
        {palettes.map((option: PaletteType) => {
          const selected = option.id === palette.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setPaletteId(option.id)}
              accessibilityRole="button"
              accessibilityLabel={`${option.name} theme`}
              accessibilityState={{ selected }}
              style={[styles.paletteOption, selected && { borderColor: option.accents.settings }]}
            >
              <View style={styles.swatchRow}>
                <View style={[styles.swatch, { backgroundColor: option.accents.checkIn }]} />
                <View style={[styles.swatch, { backgroundColor: option.accents.history }]} />
                <View style={[styles.swatch, { backgroundColor: option.accents.settings }]} />
              </View>
              <Text style={styles.paletteName}>{option.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
      <View style={styles.paletteRow}>
        {LANGUAGES.map((option: { code: LanguageCode; label: string }) => {
          const selected = option.code === language;
          return (
            <Pressable
              key={option.code}
              onPress={() => setLanguage(option.code)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              style={[styles.paletteOption, selected && { borderColor: palette.accents.settings }]}
            >
              <Text style={styles.paletteName}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>{t('settings.about')}</Text>
      <Pressable
        onPress={() => router.push('/privacy')}
        style={styles.row}
        accessibilityRole="button"
      >
        <Text style={styles.rowLabel}>{t('settings.privacyPolicy')}</Text>
        <Text style={styles.rowChevron}>›</Text>
      </Pressable>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t('settings.version')}</Text>
        <Text style={styles.rowValue}>{version}</Text>
      </View>

      <Text style={styles.footnote}>{t('settings.footnote')}</Text>
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.ink,
      marginBottom: spacing.lg,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.inkMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    paletteRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    paletteOption: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 2,
      borderColor: colors.border,
      padding: spacing.md,
      alignItems: 'center',
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: spacing.xs,
    },
    swatch: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    paletteName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.ink,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    rowLabel: {
      fontSize: 15,
      color: colors.ink,
      fontWeight: '500',
    },
    rowValue: {
      fontSize: 15,
      color: colors.inkMuted,
    },
    rowChevron: {
      fontSize: 18,
      color: colors.inkFaint,
    },
    footnote: {
      fontSize: 13,
      color: colors.inkMuted,
      marginTop: spacing.lg,
      lineHeight: 18,
    },
  });
}
