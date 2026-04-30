import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { KOLKATA_LISTINGS } from '@/src/data/listings';
import { getTheme, radii } from '@/src/theme/design';

const averageRent = Math.round(KOLKATA_LISTINGS.reduce((sum, listing) => sum + listing.rent, 0) / KOLKATA_LISTINGS.length);
const averageAura =
  KOLKATA_LISTINGS.reduce((sum, listing) => sum + listing.auraScore, 0) / Math.max(KOLKATA_LISTINGS.length, 1);
const verifiedCount = KOLKATA_LISTINGS.filter((listing) => listing.verified).length;
const topAreas = [...new Set(KOLKATA_LISTINGS.map((listing) => listing.area))].slice(0, 5);

export function MarketScreen() {
  const { state } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Market intelligence</Text>
        <Text style={styles.title}>Kolkata student housing signals</Text>
        <Text style={styles.subtitle}>A product-ready replacement for the starter Explore tab.</Text>

        <View style={styles.grid}>
          <MetricCard label="Avg rent" value={`Rs ${averageRent.toLocaleString()}`} styles={styles} />
          <MetricCard label="Avg aura" value={averageAura.toFixed(1)} styles={styles} />
          <MetricCard label="Verified" value={`${verifiedCount}/${KOLKATA_LISTINGS.length}`} styles={styles} />
          <MetricCard label="Areas" value={`${topAreas.length}+`} styles={styles} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>High-signal neighborhoods</Text>
          {topAreas.map((area) => {
            const listings = KOLKATA_LISTINGS.filter((listing) => listing.area === area);
            const areaAverageRent = Math.round(listings.reduce((sum, listing) => sum + listing.rent, 0) / listings.length);
            return (
              <View key={area} style={styles.areaRow}>
                <View>
                  <Text style={styles.areaName}>{area}</Text>
                  <Text style={styles.areaMeta}>{listings.length} listings tracked</Text>
                </View>
                <Text style={styles.areaRent}>Rs {areaAverageRent.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production hooks to add next</Text>
          <Text style={styles.body}>Live inventory sync, demand scoring, host response SLAs, fraud checks, and CRM handoff.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 16,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 12,
  },
  areaName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  areaMeta: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  areaRent: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
});
