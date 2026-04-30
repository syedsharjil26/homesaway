import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Listing } from '@/src/data/listings';
import { AppTheme, radii } from '@/src/theme/design';

type ComparePanelProps = {
  listings: Listing[];
  colors: AppTheme;
  onRemove: (listingId: string) => void;
};

export function ComparePanel({ listings, colors, onRemove }: ComparePanelProps) {
  const styles = makeStyles(colors);

  if (listings.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Decision Desk</Text>
          <Text style={styles.title}>Compare listings</Text>
        </View>
        <Text style={styles.hint}>{listings.length}/2 selected</Text>
      </View>

      {listings.map((listing) => (
        <View key={`compare-${listing.id}`} style={styles.row}>
          <View style={styles.rowTop}>
            <Text style={styles.name}>{listing.title}</Text>
            <TouchableOpacity onPress={() => onRemove(listing.id)} hitSlop={10}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.meta}>Rent: Rs {listing.rent.toLocaleString()} | Deposit: Rs {listing.deposit.toLocaleString()}</Text>
          <Text style={styles.meta}>Aura: {listing.auraScore.toFixed(1)} | {listing.verified ? 'Verified' : 'Unverified'}</Text>
          <Text style={styles.meta}>{listing.distanceToMetro}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
  card: {
    marginTop: 4,
    marginBottom: 24,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.blueSoft,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 3,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: 12,
    marginTop: 10,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  remove: {
    color: colors.rose,
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
