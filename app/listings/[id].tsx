import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { Listing } from '@/src/data/listings';
import { ListingDetailScreen } from '@/src/features/listings/screens/ListingDetailScreen';
import { fetchListingById } from '@/src/services/supabaseListings';
import { getTheme } from '@/src/theme/design';

export default function ListingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const listingId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false);
      setListing(null);
      return;
    }

    let isCancelled = false;

    const loadListing = async () => {
      setIsLoading(true);
      try {
        const fetched = await fetchListingById(listingId);
        if (!isCancelled) {
          setListing(fetched);
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
  }, [listingId]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.blue} />
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.title, { color: colors.ink }]}>Listing not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <ListingDetailScreen
      listing={listing}
      colors={colors}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      onRequestBooking={() => router.push({ pathname: '/bookings/new', params: { listingId: listing.id } })}
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
