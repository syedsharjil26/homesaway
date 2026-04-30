import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { OwnerListingDetailScreen } from '@/src/features/owner/screens/OwnerListingDetailScreen';
import {
  buildOwnerListingDetail,
  deleteOwnerListing,
  fetchOwnerListingManagementDetail,
  rotateOwnerListingCover,
  setOwnerListingPaused,
  updateOwnerInquiryAction,
  updateOwnerListingControls,
  updateOwnerListingRent,
} from '@/src/services/ownerListingManagementService';
import type { InquiryStatus } from '@/src/services/supabaseInquiries';
import { getTheme } from '@/src/theme/design';
import type { OwnerListingControls, OwnerListingManagementDetail } from '@/src/types/owner';

export default function OwnerListingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, profile } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const listingId = Array.isArray(id) ? id[0] : id;
  const [detail, setDetail] = useState<OwnerListingManagementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    if (!profile || !listingId) {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const nextDetail = await fetchOwnerListingManagementDetail(profile.id, listingId);
      setDetail(nextDetail);
    } catch (loadError) {
      setDetail(null);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load listing management view.');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, profile]);

  useEffect(() => {
    if (profile?.role !== 'owner') {
      setIsLoading(false);
      return;
    }

    void loadDetail();
  }, [loadDetail, profile?.role]);

  const updateListing = async (operation: () => Promise<OwnerListingManagementDetail['listing']>) => {
    if (!detail) {
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const updatedListing = await operation();
      setDetail(buildOwnerListingDetail(updatedListing, detail.inquiries));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update listing.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) {
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      await deleteOwnerListing(detail.listing.id);
      router.replace('/owner/listings');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete listing.');
      setIsBusy(false);
    }
  };

  const handleInquiryStatus = async (inquiryId: string, status: InquiryStatus) => {
    if (!detail) {
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      await updateOwnerInquiryAction(inquiryId, status);
      const nextInquiries = detail.inquiries.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, status } : inquiry));
      setDetail(buildOwnerListingDetail(detail.listing, nextInquiries));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update inquiry.');
    } finally {
      setIsBusy(false);
    }
  };

  if (profile?.role !== 'owner') {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.title, { color: colors.ink }]}>Owner access only</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.blue} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading owner dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.canvas }]}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.title, { color: colors.ink }]}>Listing unavailable</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{error || 'This listing could not be opened.'}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.navy }]} activeOpacity={0.9} onPress={() => router.replace('/owner/listings')}>
            <Text style={[styles.buttonText, { color: colors.canvas }]}>Back to listings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OwnerListingDetailScreen
      detail={detail}
      colors={colors}
      isBusy={isBusy}
      error={error}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/owner/listings'))}
      onEdit={() => router.push({ pathname: '/owner/listings', params: { editId: detail.listing.id } })}
      onDelete={handleDelete}
      onRefresh={loadDetail}
      onUpdateRent={(rent) => updateListing(() => updateOwnerListingRent(detail.listing, rent))}
      onRotateCover={() => updateListing(() => rotateOwnerListingCover(detail.listing))}
      onTogglePaused={() => updateListing(() => setOwnerListingPaused(detail.listing, detail.status !== 'Paused'))}
      onUpdateControls={(controls: OwnerListingControls) => updateListing(() => updateOwnerListingControls(detail.listing, controls))}
      onUpdateInquiryStatus={handleInquiryStatus}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyWrap: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
