import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { fetchInquiriesForListings, InquiryStatus, OwnerInquiry, updateInquiryStatus } from '@/src/services/supabaseInquiries';
import { fetchOwnerListings } from '@/src/services/supabaseListings';
import { AppTheme, getTheme, radii } from '@/src/theme/design';

type OwnerInquiryInboxScreenProps = {
  onBack: () => void;
};

const STATUS_ACTIONS: { label: string; status: InquiryStatus }[] = [
  { label: 'New', status: 'new' },
  { label: 'Approve', status: 'approved' },
  { label: 'Contacted', status: 'contacted' },
  { label: 'Booked', status: 'booked' },
  { label: 'Reject', status: 'rejected' },
];

export function OwnerInquiryInboxScreen({ onBack }: OwnerInquiryInboxScreenProps) {
  const { state, profile } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const styles = makeStyles(colors);
  const [inquiries, setInquiries] = useState<OwnerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) {
      return;
    }

    let isCancelled = false;

    const loadInbox = async () => {
      setIsLoading(true);
      setError('');
      try {
        const ownerListings = await fetchOwnerListings(profile.id);
        const ownerInquiries = await fetchInquiriesForListings(ownerListings);
        if (!isCancelled) {
          setInquiries(ownerInquiries);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load inquiries');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInbox();

    return () => {
      isCancelled = true;
    };
  }, [profile]);

  const handleStatusUpdate = async (inquiryId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? { ...item, status } : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update inquiry');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inquiry Inbox</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>Pipeline</Text>
          <Text style={styles.summaryTitle}>{inquiries.length} live inquiries</Text>
          <Text style={styles.summaryText}>Review student leads, mark follow-ups, and close bookings quickly.</Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Inbox unavailable</Text>
            <Text style={styles.emptySub}>{error}</Text>
          </View>
        ) : inquiries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No inquiries yet</Text>
            <Text style={styles.emptySub}>Student booking requests will appear here once submitted.</Text>
          </View>
        ) : (
          inquiries.map((lead) => (
            <View key={lead.id} style={styles.leadCard}>
              <Text style={styles.propertyText}>{lead.listingTitle}</Text>
              <Text style={styles.metaText}>Name: {lead.fullName || 'Unknown'}</Text>
              <Text style={styles.metaText}>Phone: {lead.phone || 'Not provided'}</Text>
              <Text style={styles.metaText}>Budget: {lead.budget ? `Rs ${lead.budget.toLocaleString()}` : 'Not provided'}</Text>
              <Text style={styles.metaText}>Move-in: {lead.moveInDate || 'Not provided'}</Text>
              {lead.college ? <Text style={styles.metaText}>Context: {lead.college}</Text> : null}
              {lead.message ? <Text style={styles.metaText}>Message: {lead.message}</Text> : null}
              <Text style={styles.dateText}>{new Date(lead.createdAt).toLocaleString()}</Text>

              <View style={styles.statusRow}>
                {STATUS_ACTIONS.map((action) => {
                  const isActive = lead.status === action.status;
                  return (
                    <TouchableOpacity
                      key={`${lead.id}-${action.status}`}
                      style={[styles.statusChip, isActive && styles.statusChipActive]}
                      activeOpacity={0.9}
                      onPress={() => handleStatusUpdate(lead.id, action.status)}>
                      <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>{action.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    headerRow: {
      paddingTop: 14,
      paddingHorizontal: 16,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      borderRadius: 999,
      backgroundColor: colors.surface,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },
    backText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    headerTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    headerSpacer: {
      width: 54,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 12,
    },
    summaryCard: {
      borderRadius: radii.xl,
      backgroundColor: colors.navy,
      padding: 16,
    },
    eyebrow: {
      color: '#BBD2FF',
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    summaryTitle: {
      marginTop: 8,
      color: colors.canvas,
      fontSize: 22,
      fontWeight: '900',
    },
    summaryText: {
      marginTop: 7,
      color: colors.canvas,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '600',
    },
    emptyCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 20,
      alignItems: 'center',
      gap: 8,
    },
    emptyTitle: {
      color: colors.ink,
      fontSize: 17,
      fontWeight: '900',
    },
    emptySub: {
      color: colors.muted,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '600',
    },
    leadCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 15,
      gap: 5,
    },
    propertyText: {
      marginBottom: 3,
      color: colors.ink,
      fontSize: 15,
      fontWeight: '900',
    },
    metaText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '600',
    },
    dateText: {
      marginTop: 6,
      color: colors.subtle,
      fontSize: 12,
      fontWeight: '600',
    },
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    statusChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    statusChipActive: {
      borderColor: colors.blue,
      backgroundColor: colors.blueSoft,
    },
    statusChipText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'capitalize',
    },
    statusChipTextActive: {
      color: colors.blue,
    },
  });
