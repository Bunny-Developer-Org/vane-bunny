import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const styles = createStyles(palette);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>

      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: July 2026</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryStrong}>The short version: </Text>
          Vane Bunny collects nothing. There&apos;s no account, no analytics, no crash reporting,
          and no network access at all. Everything you enter stays only on your device.
        </Text>
      </View>

      <Section title="What data we collect" styles={styles}>
        None. Vane Bunny does not have user accounts, does not use analytics or advertising SDKs,
        does not use crash-reporting services, and does not make any network requests. There is
        nothing for us — the developer — to see, store, or receive.
      </Section>

      <Section title="What the app stores, and where" styles={styles}>
        When you log a mood check-in (a score from 1–10 and an optional short note), it&apos;s saved
        using your device&apos;s local on-device storage only. It never leaves your device — not to
        a server, not to us, not to anyone.
      </Section>

      <Section title="Deleting your data" styles={styles}>
        You can delete an individual check-in at any time from within the app. Uninstalling the app
        removes all of its data from your device, since nothing exists anywhere else.
      </Section>

      <Section title="Third parties" styles={styles}>
        None are involved. Vane Bunny doesn&apos;t share data with anyone because it doesn&apos;t
        collect or transmit any data in the first place.
      </Section>

      <Section title="Children's privacy" styles={styles}>
        Because the app collects no personal information from anyone, it does not knowingly collect
        information from children either.
      </Section>

      <Section title="Changes to this policy" styles={styles}>
        If Vane Bunny&apos;s data practices ever change (for example, if a future version adds
        optional cloud sync), this page will be updated first, and the change will be reflected in
        the app&apos;s description in whichever app store it&apos;s distributed through.
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
