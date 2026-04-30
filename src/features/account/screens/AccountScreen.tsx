import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { getTheme, radii } from '@/src/theme/design';

export function AccountScreen() {
  const { state, setState, profile, signOut } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const styles = makeStyles(colors);

  const toggleTheme = () => {
    setState((prev) => ({ ...prev, themeMode: prev.themeMode === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.title}>{profile?.fullName || 'HomesAway Beta'}</Text>
        <Text style={styles.subtitle}>Your account details from your verified HomesAway profile.</Text>

        <View style={styles.card}>
          <DetailRow label="Role" value={profile?.role ?? 'Unknown'} styles={styles} />
          <DetailRow label="Email" value={profile?.email ?? 'Unknown'} styles={styles} />
          <DetailRow label="Phone" value={profile?.phone || 'Not added'} styles={styles} />
          <DetailRow label="City" value={profile?.city || 'Kolkata'} styles={styles} />
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.92} onPress={toggleTheme}>
          <Text style={styles.primaryButtonText}>Switch to {state.themeMode === 'dark' ? 'light' : 'dark'} mode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.92} onPress={signOut}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 28,
    },
    eyebrow: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      marginTop: 6,
      color: colors.ink,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
    },
    subtitle: {
      marginTop: 8,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    card: {
      marginTop: 20,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 12,
    },
    detailRow: {
      gap: 4,
    },
    detailLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    detailValue: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: '800',
    },
    primaryButton: {
      marginTop: 18,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
    },
    primaryButtonText: {
      color: colors.canvas,
      fontSize: 14,
      fontWeight: '900',
    },
    secondaryButton: {
      marginTop: 10,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
    },
    secondaryButtonText: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: '900',
    },
  });
