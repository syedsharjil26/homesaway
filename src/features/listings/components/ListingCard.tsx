import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Listing } from '@/src/data/listings';
import { AppTheme, radii, shadow } from '@/src/theme/design';

type ListingCardProps = {
  listing: Listing;
  isCompared: boolean;
  colors: AppTheme;
  onOpen: (listing: Listing) => void;
  onToggleCompare: (listingId: string) => void;
};

export function ListingCard({ listing, isCompared, colors, onOpen, onToggleCompare }: ListingCardProps) {
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={() => onOpen(listing)}>
      <View style={[styles.image, { backgroundColor: listing.imageColor }]}>
        <View style={styles.imageShade}>
          <Text style={styles.areaPill}>{listing.locality}</Text>
          {listing.verified ? <Text style={styles.verifiedPill}>Verified</Text> : null}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.meta}>
              {listing.genderType} | {listing.roomType} | {listing.foodPreference} food
            </Text>
          </View>
          <Text style={styles.score}>{listing.auraScore.toFixed(1)}</Text>
        </View>

        <View style={styles.rentRow}>
          <Text style={styles.rent}>Rs {listing.rent.toLocaleString()}/month</Text>
          <Text style={styles.localityTag}>{listing.locality}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            {listing.availableBeds} beds open | {listing.distanceToMetro}
          </Text>
          <TouchableOpacity
            style={[styles.compareButton, isCompared && styles.compareButtonActive]}
            activeOpacity={0.9}
            onPress={() => onToggleCompare(listing.id)}>
            <Text style={[styles.compareText, isCompared && styles.compareTextActive]}>{isCompared ? 'Comparing' : 'Compare'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    card: {
      marginBottom: 18,
      overflow: 'hidden',
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
      ...shadow,
    },
    image: {
      height: 158,
    },
    imageShade: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: 14,
    },
    areaPill: {
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: '#FFFFFFE6',
      paddingHorizontal: 13,
      paddingVertical: 8,
      color: '#0F172A',
      fontSize: 12,
      fontWeight: '800',
    },
    verifiedPill: {
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: colors.navy,
      paddingHorizontal: 13,
      paddingVertical: 8,
      color: colors.canvas,
      fontSize: 12,
      fontWeight: '800',
    },
    body: {
      padding: 18,
    },
    titleRow: {
      flexDirection: 'row',
      gap: 12,
    },
    titleWrap: {
      flex: 1,
    },
    title: {
      color: colors.ink,
      fontSize: 19,
      fontWeight: '900',
    },
    meta: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 13,
      fontWeight: '600',
    },
    score: {
      minWidth: 44,
      height: 34,
      overflow: 'hidden',
      borderRadius: 17,
      backgroundColor: colors.greenSoft,
      color: colors.green,
      textAlign: 'center',
      lineHeight: 34,
      fontSize: 14,
      fontWeight: '900',
    },
    rent: {
      color: colors.amber,
      fontSize: 22,
      fontWeight: '900',
    },
    rentRow: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    localityTag: {
      borderRadius: 999,
      backgroundColor: colors.blueSoft,
      color: colors.navy,
      paddingHorizontal: 12,
      paddingVertical: 7,
      fontSize: 11,
      fontWeight: '900',
      overflow: 'hidden',
    },
    footerRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    footerText: {
      flex: 1,
      color: colors.muted,
      fontSize: 12,
      fontWeight: '600',
    },
    compareButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.canvas,
    },
    compareButtonActive: {
      borderColor: colors.blue,
      backgroundColor: colors.blueSoft,
    },
    compareText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '800',
    },
    compareTextActive: {
      color: colors.blue,
    },
  });
