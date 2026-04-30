import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Listing } from '@/src/data/listings';
import { AppTheme, radii } from '@/src/theme/design';

type RecentlyViewedRailProps = {
  listings: Listing[];
  colors: AppTheme;
  onOpen: (listing: Listing) => void;
};

export function RecentlyViewedRail({ listings, colors, onOpen }: RecentlyViewedRailProps) {
  const styles = makeStyles(colors);

  if (listings.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Recently viewed</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {listings.map((listing) => (
          <TouchableOpacity
            key={`recent-${listing.id}`}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onOpen(listing)}>
            <View style={[styles.image, { backgroundColor: listing.imageColor }]} />
            <Text style={styles.cardTitle}>{listing.title}</Text>
            <Text style={styles.meta}>{listing.area}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 10,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    gap: 10,
    paddingRight: 16,
  },
  card: {
    width: 154,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 10,
  },
  image: {
    height: 72,
    borderRadius: radii.md,
    marginBottom: 9,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
