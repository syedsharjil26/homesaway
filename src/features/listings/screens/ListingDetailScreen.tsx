import { Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Listing } from '@/src/data/listings';
import { AppTheme, radii } from '@/src/theme/design';

type ListingDetailScreenProps = {
  listing: Listing;
  colors: AppTheme;
  onBack: () => void;
  onRequestBooking: () => void;
};

export function ListingDetailScreen({ listing, colors, onBack, onRequestBooking }: ListingDetailScreenProps) {
  const styles = makeStyles(colors);
  const averageRating =
    listing.reviews.reduce((acc, review) => acc + review.rating, 0) / Math.max(listing.reviews.length, 1);

  const handleCall = async () => {
    await Linking.openURL(`tel:${listing.ownerPhone.replace(/\s/g, '')}`);
  };

  const handleWhatsApp = async () => {
    const message = encodeURIComponent(
      `Hi ${listing.ownerName}, I am interested in ${listing.title} in ${listing.area}. Is it still available?`
    );
    await Linking.openURL(`https://wa.me/${listing.ownerPhone.replace(/[^\d]/g, '')}?text=${message}`);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${listing.title} in ${listing.area}, Kolkata - Rent Rs ${listing.rent}/month.`,
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: listing.imageColor }]}>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.9} onPress={onBack}>
              <Text style={styles.iconText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroLabel}>
            <Text style={styles.heroEyebrow}>{listing.area}, Kolkata</Text>
            <Text style={styles.heroTitle}>{listing.title}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.rent}>Rs {listing.rent.toLocaleString()}/month</Text>
          <Text style={styles.summaryMeta}>
            Deposit Rs {listing.deposit.toLocaleString()} | {listing.genderType} | {listing.roomType}
          </Text>
          <View style={styles.badgeRow}>
            {listing.verified ? <Text style={[styles.badge, styles.verifiedBadge]}>Verified</Text> : null}
            {listing.auraScore > 0 ? <Text style={[styles.badge, styles.auraBadge]}>Aura {listing.auraScore.toFixed(1)}</Text> : null}
            {listing.reviews.length > 0 ? <Text style={[styles.badge, styles.ratingBadge]}>{averageRating.toFixed(1)} rating</Text> : null}
            <Text style={[styles.badge, styles.auraBadge]}>{listing.foodPreference} food</Text>
            <Text style={[styles.badge, styles.verifiedBadge]}>{listing.availableBeds} beds open</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.9} onPress={handleShare}>
          <Text style={styles.shareText}>Share Listing</Text>
        </TouchableOpacity>

        <Section title="Amenities" styles={styles}>
          <View style={styles.chipRow}>
            {listing.amenities.map((amenity) => (
              <Text key={amenity} style={styles.chip}>
                {amenity}
              </Text>
            ))}
          </View>
        </Section>

        <Section title="About property" styles={styles}>
          <Text style={styles.bodyText}>{listing.description}</Text>
        </Section>

        <Section title="Commute" styles={styles}>
          <Text style={styles.bodyText}>{listing.distanceToMetro || 'Metro distance not added yet.'}</Text>
          <Text style={styles.bodyText}>{listing.distanceToCollege || 'College distance not added yet.'}</Text>
        </Section>

        <Section title="Host" styles={styles}>
          <View style={styles.hostCard}>
            <Text style={styles.hostName}>{listing.ownerName}</Text>
            <Text style={styles.bodyText}>Direct host contact for this beta listing</Text>
            <Text style={styles.hostPhone}>{listing.ownerPhone}</Text>
          </View>
        </Section>

        {listing.reviews.length > 0 ? (
          <Section title={`Reviews (${listing.reviews.length})`} styles={styles}>
            <View style={styles.reviewWrap}>
              {listing.reviews.map((review, index) => (
                <View key={`${review.name}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewHead}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewRating}>{review.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.reviewType}>{review.stayType}</Text>
                  <Text style={styles.bodyText}>{review.comment}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={handleCall}>
            <Text style={styles.secondaryText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={handleWhatsApp}>
            <Text style={styles.secondaryText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.92} onPress={onRequestBooking}>
          <Text style={styles.primaryText}>Request Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      paddingBottom: 170,
    },
    hero: {
      height: 310,
      justifyContent: 'space-between',
      padding: 16,
    },
    heroActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    iconButton: {
      borderRadius: 999,
      backgroundColor: '#FFFFFFE6',
      paddingHorizontal: 13,
      paddingVertical: 9,
    },
    iconText: {
      color: '#101828',
      fontSize: 12,
      fontWeight: '900',
    },
    heroLabel: {
      borderRadius: radii.xl,
      backgroundColor: '#FFFFFFE6',
      padding: 16,
    },
    heroEyebrow: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    heroTitle: {
      marginTop: 5,
      color: '#101828',
      fontSize: 28,
      fontWeight: '900',
    },
    summaryCard: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.line,
    },
    rent: {
      color: colors.ink,
      fontSize: 25,
      fontWeight: '900',
    },
    summaryMeta: {
      marginTop: 6,
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
    },
    badgeRow: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    badge: {
      overflow: 'hidden',
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      fontSize: 12,
      fontWeight: '900',
    },
    verifiedBadge: {
      backgroundColor: colors.greenSoft,
      color: colors.green,
    },
    auraBadge: {
      backgroundColor: colors.blueSoft,
      color: colors.blue,
    },
    ratingBadge: {
      backgroundColor: colors.amberSoft,
      color: colors.amber,
    },
    shareButton: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      alignItems: 'center',
    },
    shareText: {
      color: colors.blue,
      fontSize: 14,
      fontWeight: '900',
    },
    section: {
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 16,
    },
    sectionTitle: {
      marginBottom: 10,
      color: colors.ink,
      fontSize: 17,
      fontWeight: '900',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.ink,
      fontSize: 12,
      fontWeight: '800',
      borderWidth: 1,
      borderColor: colors.line,
    },
    bodyText: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '600',
    },
    hostCard: {
      borderRadius: radii.lg,
      backgroundColor: colors.elevated,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.line,
    },
    hostName: {
      marginBottom: 4,
      color: colors.ink,
      fontSize: 16,
      fontWeight: '900',
    },
    hostPhone: {
      marginTop: 5,
      color: colors.blue,
      fontSize: 13,
      fontWeight: '900',
    },
    reviewWrap: {
      gap: 10,
    },
    reviewCard: {
      borderRadius: radii.lg,
      backgroundColor: colors.elevated,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.line,
    },
    reviewHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    reviewName: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: '900',
    },
    reviewRating: {
      color: colors.amber,
      fontSize: 13,
      fontWeight: '900',
    },
    reviewType: {
      marginTop: 2,
      marginBottom: 5,
      color: colors.blue,
      fontSize: 12,
      fontWeight: '800',
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 16,
      gap: 10,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      height: 48,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.canvas,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: '900',
    },
    primaryButton: {
      height: 50,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      color: colors.canvas,
      fontSize: 15,
      fontWeight: '900',
    },
  });
