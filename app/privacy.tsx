import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../src/i18n';
import { useTheme, radii, spacing, type Palette } from '../src/theme';

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { t } = useI18n();
  const styles = createStyles(palette);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>{t('common.back')}</Text>
      </Pressable>

      <Text style={styles.title}>{t('privacy.title')}</Text>
      <Text style={styles.updated}>{t('privacy.updated')}</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryStrong}>{t('privacy.summaryStrong')}</Text>
          {t('privacy.summaryText')}
        </Text>
      </View>

      <Section title={t('privacy.sectionCollectTitle')} styles={styles}>
        {t('privacy.sectionCollectBody')}
      </Section>

      <Section title={t('privacy.sectionStoreTitle')} styles={styles}>
        {t('privacy.sectionStoreBody')}
      </Section>

      <Section title={t('privacy.sectionDeleteTitle')} styles={styles}>
        {t('privacy.sectionDeleteBody')}
      </Section>

      <Section title={t('privacy.sectionThirdPartyTitle')} styles={styles}>
        {t('privacy.sectionThirdPartyBody')}
      </Section>

      <Section title={t('privacy.sectionChildrenTitle')} styles={styles}>
        {t('privacy.sectionChildrenBody')}
      </Section>

      <Section title={t('privacy.sectionChangesTitle')} styles={styles}>
        {t('privacy.sectionChangesBody')}
      </Section>
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
    back: {
      fontSize: 15,
      color: colors.sageDark,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.ink,
    },
    updated: {
      fontSize: 13,
      color: colors.inkMuted,
      marginTop: 2,
      marginBottom: spacing.lg,
    },
    summary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    summaryText: {
      fontSize: 15,
      color: colors.ink,
      lineHeight: 21,
    },
    summaryStrong: {
      fontWeight: '700',
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    sectionBody: {
      fontSize: 15,
      color: colors.inkMuted,
      lineHeight: 21,
    },
  });
}
