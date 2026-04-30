import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { FOOD_FILTERS, FoodPreference, Listing, LOCALITY_FILTERS, LocalityFilter } from '@/src/data/listings';
import { ComparePanel } from '@/src/features/listings/components/ComparePanel';
import { ListingCard } from '@/src/features/listings/components/ListingCard';
import { ListingFilters } from '@/src/features/listings/components/ListingFilters';
import { RecentlyViewedRail } from '@/src/features/listings/components/RecentlyViewedRail';
import { AuthScreen } from '@/src/features/onboarding/AuthScreen';
import { filterListings } from '@/src/services/listingService';
import { fetchInquiriesForListings } from '@/src/services/supabaseInquiries';
import { fetchOwnerListings, fetchPublicListings } from '@/src/services/supabaseListings';
import { getTheme, radii } from '@/src/theme/design';

export function HomeScreen() {
  const router = useRouter();
  const { state, setState, ready, authLoading, session, profile, isProfileLoading, profileError, refreshProfile, signOut } =
    useAppStateContext();
  const colors = getTheme(state.themeMode);
  const styles = makeStyles(colors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<LocalityFilter>('All');
  const [selectedFoodPreference, setSelectedFoodPreference] = useState<FoodPreference>('Any');
  const [maxRent, setMaxRent] = useState('');
  const [publicListings, setPublicListings] = useState<Listing[]>([]);
  const [ownerListingCount, setOwnerListingCount] = useState(0);
  const [ownerInquiryCount, setOwnerInquiryCount] = useState(0);
  const [isLoadingPublicListings, setIsLoadingPublicListings] = useState(false);
  const [loadError, setLoadError] = useState('');

  const filteredListings = useMemo(
    () =>
      filterListings(publicListings, {
        searchQuery,
        locality: selectedLocality,
        foodPreference: selectedFoodPreference,
        maxRent,
      }),
    [maxRent, publicListings, searchQuery, selectedFoodPreference, selectedLocality]
  );

  const recentlyViewedListings = useMemo(
    () =>
      state.recentlyViewedIds
        .map((id) => publicListings.find((listing) => listing.id === id))
        .filter(Boolean)
        .slice(0, 5) as Listing[],
    [publicListings, state.recentlyViewedIds]
  );

  const compareListings = useMemo(
    () => state.compareIds.map((id) => publicListings.find((listing) => listing.id === id)).filter(Boolean) as Listing[],
    [publicListings, state.compareIds]
  );

  const openListingRoute = (listingId: string) => {
    setState((prev) => {
      const withoutCurrent = prev.recentlyViewedIds.filter((id) => id !== listingId);
      return {
        ...prev,
        recentlyViewedIds: [listingId, ...withoutCurrent].slice(0, 5),
      };
    });

    router.push({ pathname: '/listings/[id]', params: { id: listingId } });
  };

  const loadMarketplace = useCallback(async () => {
    setIsLoadingPublicListings(true);
    setLoadError('');

    try {
      const nextListings = await fetchPublicListings();
      setPublicListings(nextListings);

      if (profile?.role === 'owner') {
        const ownerListings = await fetchOwnerListings(profile.id);
        const ownerInquiries = await fetchInquiriesForListings(ownerListings);
        setOwnerListingCount(ownerListings.length);
        setOwnerInquiryCount(ownerInquiries.length);
      } else {
        setOwnerListingCount(0);
        setOwnerInquiryCount(0);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load marketplace data.');
    } finally {
      setIsLoadingPublicListings(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'owner') {
      router.replace('/owner/listings');
    } else if (profile?.role === 'admin') {
      // router.replace('/admin/dashboard'); // if exists
    }
  }, [profile, router]);

  useEffect(() => {
    if (!session || !profile) {
      return;
    }
    loadMarketplace();
  }, [loadMarketplace, profile, session]);

  const toggleCompare = (listingId: string) => {
    setState((prev) => {
      if (prev.compareIds.includes(listingId)) {
        return { ...prev, compareIds: prev.compareIds.filter((id) => id !== listingId) };
      }
      if (prev.compareIds.length >= 2) {
        return prev;
      }
      return { ...prev, compareIds: [...prev.compareIds, listingId] };
    });
  };

  if (!ready || authLoading || (session && isProfileLoading)) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <Image source={require('@/assets/images/icon.png')} style={styles.loadingLogo} />
        <ActivityIndicator color={colors.blue} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <AuthScreen colors={colors} />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        {profileError ? (
          <>
            <Text style={{ color: colors.rose, textAlign: 'center', marginBottom: 16 }}>
              Profile load failed: {profileError}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: colors.blue, padding: 12, borderRadius: 8 }}
              onPress={refreshProfile}
              activeOpacity={0.9}
            >
              <Text style={{ color: colors.canvas, textAlign: 'center', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ color: colors.muted, textAlign: 'center' }}>Loading profile...</Text>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={require('@/components/screens/home_screen_bg.png')} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>Welcome to HomesAway</Text>
            <View style={styles.titleRow}>
              <Image source={require('@/assets/images/icon.png')} style={styles.titleIcon} />
              <Text style={styles.title}>{profile.role === 'owner' ? 'Owner workspace' : `Hi ${profile.fullName}`}</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Kolkata-ready student stays with trusted localities and quick discovery.
            </Text>
            <TouchableOpacity style={styles.heroCta} activeOpacity={0.9}>
              <Text style={styles.heroCtaText}>Search Kolkata Listings</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.subtitle}>
              {profile.role === 'owner'
                ? 'Manage live listings and respond to real inquiry records.'
                : 'Browse live Kolkata listings and send real booking inquiries.'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {profile.role === 'owner' ? (
              <>
                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/owner/listings' })}>
                  <Text style={styles.iconButtonText}>Listings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.9}
                  onPress={() => router.push('/owner/inquiries' as Href)}>
                  <Text style={styles.iconButtonText}>Inbox</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.9}
                onPress={() => router.push('/owner/request' as Href)}>
                <Text style={styles.iconButtonText}>List Your PG</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.9} onPress={signOut}>
              <Text style={styles.iconButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{publicListings.length}</Text>
            <Text style={styles.statLabel}>Live Listings</Text>
          </View>
          {profile.role === 'owner' ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ownerListingCount}</Text>
                <Text style={styles.statLabel}>Your Listings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{ownerInquiryCount}</Text>
                <Text style={styles.statLabel}>Inquiries</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{recentlyViewedListings.length}</Text>
                <Text style={styles.statLabel}>Viewed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{compareListings.length}</Text>
                <Text style={styles.statLabel}>Compare</Text>
              </View>
            </>
          )}
        </View>

        <RecentlyViewedRail listings={recentlyViewedListings} colors={colors} onOpen={(listing) => openListingRoute(listing.id)} />

        <ListingFilters
          searchQuery={searchQuery}
          selectedLocality={selectedLocality}
          selectedFoodPreference={selectedFoodPreference}
          maxRent={maxRent}
          localities={LOCALITY_FILTERS}
          foodPreferences={FOOD_FILTERS}
          colors={colors}
          onSearchChange={setSearchQuery}
          onLocalityChange={(value) => setSelectedLocality(value as LocalityFilter)}
          onFoodPreferenceChange={(value) => setSelectedFoodPreference(value as FoodPreference)}
          onMaxRentChange={setMaxRent}
        />

        {isLoadingPublicListings ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Marketplace unavailable</Text>
            <Text style={styles.emptySub}>{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} activeOpacity={0.9} onPress={loadMarketplace}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySub}>Try a different area or search keyword.</Text>
          </View>
        ) : (
          filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isCompared={state.compareIds.includes(listing.id)}
              colors={colors}
              onOpen={(listingValue) => openListingRoute(listingValue.id)}
              onToggleCompare={toggleCompare}
            />
          ))
        )}

        <ComparePanel listings={compareListings} colors={colors} onRemove={toggleCompare} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    loadingRoot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.canvas,
    },
    loadingLogo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 28,
    },
    hero: {
      height: 214,
      borderRadius: radii.xl,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: colors.navy,
    },
    heroImage: {
      opacity: 0.95,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(16, 24, 40, 0.38)',
    },
    heroContent: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: 18,
      gap: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 16,
    },
    headerCopy: {
      flex: 1,
    },
    eyebrow: {
      color: '#F8FAFC',
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    titleIcon: {
      width: 32,
      height: 32,
      marginRight: 8,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 27,
      lineHeight: 32,
      fontWeight: '900',
    },
    heroSubtitle: {
      color: '#E2E8F0',
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '600',
      maxWidth: '95%',
    },
    heroCta: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      backgroundColor: colors.amber,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 2,
    },
    heroCtaText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
    },
    subtitle: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    headerActions: {
      alignItems: 'flex-end',
      gap: 8,
    },
    iconButton: {
      borderRadius: 999,
      backgroundColor: colors.navy,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    iconButtonText: {
      color: colors.canvas,
      fontSize: 12,
      fontWeight: '900',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      alignItems: 'center',
    },
    statValue: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    statLabel: {
      marginTop: 3,
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
    },
    emptyState: {
      marginTop: 28,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 20,
      alignItems: 'center',
      gap: 10,
    },
    emptyTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    emptySub: {
      color: colors.muted,
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '600',
    },
    retryButton: {
      marginTop: 4,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    retryText: {
      color: colors.canvas,
      fontSize: 13,
      fontWeight: '900',
    },
  });
