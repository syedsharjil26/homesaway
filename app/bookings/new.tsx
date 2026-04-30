import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { Listing } from '@/src/data/listings';
import { InquiryScreen } from '@/src/features/inquiries/screens/InquiryScreen';
import { fetchListingById } from '@/src/services/supabaseListings';
import { getTheme } from '@/src/theme/design';

export default function NewBookingRoute() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { state, profile } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;

  useEffect(() => {
    if (!normalizedListingId) {
      setListing(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadListing = async () => {
      setIsLoading(true);
      try {
        const nextListing = await fetchListingById(normalizedListingId);
        if (!isCancelled) {
          setListing(nextListing);
        }
      } catch {
        if (!isCancelled) {
          setListing(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadListing();

    return () => {
      isCancelled = true;
    };
  }, [normalizedListingId]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.blue} />
      </SafeAreaView>
    );
  }

  if (!listing || !profile) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.title, { color: colors.ink }]}>Booking target missing</Text>
      </SafeAreaView>
    );
  }

  return (
    <InquiryScreen
      listing={listing}
      colors={colors}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      onSubmitSuccess={() => {
        router.replace('/(tabs)');
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
});
