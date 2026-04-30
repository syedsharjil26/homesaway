import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { Listing } from '@/src/data/listings';
import {
  ListingInput,
  VALID_FOOD_PREFERENCES,
  VALID_GENDER_TYPES,
  VALID_LOCALITIES,
  VALID_ROOM_TYPES,
  validateListingInput,
} from '@/src/services/listingService';
import {
  deleteOwnerListingRecord,
  fetchOwnerListings,
  insertOwnerListing,
  toggleListingAvailabilityRecord,
  updateOwnerListingRecord,
} from '@/src/services/supabaseListings';
import { AppTheme, getTheme, radii } from '@/src/theme/design';

type OwnerListingsScreenProps = {
  initialEditId?: string;
  onBack: () => void;
  onOpenInbox: () => void;
  onOpenListing: (listingId: string) => void;
  onSubmitSuccess: () => void;
};

const defaultForm: ListingInput = {
  title: '',
  locality: 'Ballygunge',
  rent: '',
  deposit: '',
  genderType: 'Unisex',
  foodPreference: 'Both',
  roomType: 'Double',
  availableBeds: '1',
  description: '',
};

export function OwnerListingsScreen({ initialEditId, onBack, onOpenInbox, onOpenListing, onSubmitSuccess }: OwnerListingsScreenProps) {
  const { state, profile, session } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const styles = makeStyles(colors);
  const [form, setForm] = useState<ListingInput>(defaultForm);
  const [listings, setListings] = useState<Listing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appliedEditId, setAppliedEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const ownerId = session?.user.id ?? profile?.id ?? '';

  const activeCount = useMemo(() => listings.filter((listing) => listing.isAvailable && listing.availableBeds > 0).length, [listings]);
  const pausedCount = useMemo(() => listings.filter((listing) => !listing.isAvailable).length, [listings]);
  const bedsOpen = useMemo(() => listings.reduce((sum, listing) => sum + Math.max(listing.availableBeds, 0), 0), [listings]);

  const loadOwnerListings = useCallback(async () => {
    if (!ownerId) {
      setListings([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const nextListings = await fetchOwnerListings(ownerId);
      setListings(nextListings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (!ownerId) {
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const nextListings = await fetchOwnerListings(ownerId);
        if (!isCancelled) {
          setListings(nextListings);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load listings');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [ownerId]);

  useEffect(() => {
    if (!initialEditId || appliedEditId === initialEditId || listings.length === 0) {
      return;
    }

    const listing = listings.find((item) => item.id === initialEditId);
    if (listing) {
      startEdit(listing);
      setAppliedEditId(initialEditId);
    }
  }, [appliedEditId, initialEditId, listings]);

  const submitListing = async () => {
    if (!profile || !session?.user.id) {
      setError('No authenticated owner session found. Please sign in again before creating a listing.');
      return;
    }

    const validation = validateListingInput(form);
    if (!validation.ok) {
      setError(validation.message ?? 'Invalid listing input');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      if (editingId) {
        const updatedListing = await updateOwnerListingRecord(editingId, form);
        setListings((prev) => prev.map((listing) => (listing.id === editingId ? updatedListing : listing)));
        setSuccessMessage('Listing updated successfully.');
      } else {
        const createdListing = await insertOwnerListing(form, profile, session.user.id);
        setListings((prev) => [createdListing, ...prev]);
        setSuccessMessage('Listing created successfully.');
      }

      setEditingId(null);
      setForm(defaultForm);
      await loadOwnerListings();
      onSubmitSuccess();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unknown listing submission error';
      setError(message);
      Alert.alert('Could not save listing', message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      locality: listing.locality,
      rent: String(listing.rent),
      deposit: String(listing.deposit),
      genderType: listing.genderType,
      foodPreference: listing.foodPreference,
      roomType: listing.roomType,
      availableBeds: String(listing.availableBeds),
      description: listing.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
    setError('');
    setSuccessMessage('');
  };

  const removeListing = (listingId: string) => {
    Alert.alert('Delete listing', 'This will remove the listing from your owner catalog.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOwnerListingRecord(listingId);
            setListings((prev) => prev.filter((listing) => listing.id !== listingId));
            if (editingId === listingId) {
              cancelEdit();
            }
          } catch (deleteError) {
            Alert.alert('Could not delete listing', deleteError instanceof Error ? deleteError.message : 'Unknown error');
          }
        },
      },
    ]);
  };

  const toggleAvailability = async (listing: Listing) => {
    setIsSaving(true);
    try {
      const updatedListing = await toggleListingAvailabilityRecord(listing);
      setListings((prev) => prev.map((item) => (item.id === listing.id ? updatedListing : item)));
    } catch (toggleError) {
      Alert.alert('Could not update availability', toggleError instanceof Error ? toggleError.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.9} onPress={onBack}>
            <Ionicons name="chevron-back" size={18} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerKicker}>Owner Workspace</Text>
            <Text style={styles.title}>Listings</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.9} onPress={onOpenInbox}>
            <Ionicons name="mail" size={17} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.summaryBand}>
            <DashboardStat label="Total" value={String(listings.length)} styles={styles} />
            <DashboardStat label="Active" value={String(activeCount)} styles={styles} />
            <DashboardStat label="Paused" value={String(pausedCount)} styles={styles} />
            <DashboardStat label="Beds" value={String(bedsOpen)} styles={styles} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formTitleWrap}>
                <Text style={styles.formTitle}>{editingId ? 'Edit listing' : 'Create listing'}</Text>
                <Text style={styles.formSubtitle}>{editingId ? 'Update live availability and pricing.' : 'Add inventory for first real users.'}</Text>
              </View>
              {editingId ? (
                <TouchableOpacity style={styles.cancelButton} activeOpacity={0.9} onPress={cancelEdit}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Field label="Title" value={form.title} onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))} styles={styles} />
            <OptionSelector
              label="Locality"
              value={form.locality}
              options={VALID_LOCALITIES}
              styles={styles}
              onChange={(value) => setForm((prev) => ({ ...prev, locality: value as Listing['locality'] }))}
            />
            <OptionSelector
              label="Room Type"
              value={form.roomType}
              options={VALID_ROOM_TYPES}
              styles={styles}
              onChange={(value) => setForm((prev) => ({ ...prev, roomType: value as Listing['roomType'] }))}
            />
            <View style={styles.fieldGrid}>
              <Field label="Rent" value={form.rent} onChangeText={(value) => setForm((prev) => ({ ...prev, rent: value }))} styles={styles} keyboardType="number-pad" compact />
              <Field
                label="Deposit"
                value={form.deposit}
                onChangeText={(value) => setForm((prev) => ({ ...prev, deposit: value }))}
                styles={styles}
                keyboardType="number-pad"
                compact
              />
            </View>
            <Field
              label="Beds"
              value={form.availableBeds}
              onChangeText={(value) => setForm((prev) => ({ ...prev, availableBeds: value }))}
              styles={styles}
              keyboardType="number-pad"
            />
            <OptionSelector
              label="Gender"
              value={form.genderType}
              options={VALID_GENDER_TYPES}
              styles={styles}
              onChange={(value) => setForm((prev) => ({ ...prev, genderType: value as Listing['genderType'] }))}
            />
            <OptionSelector
              label="Food Preference"
              value={form.foodPreference}
              options={VALID_FOOD_PREFERENCES}
              styles={styles}
              onChange={(value) => setForm((prev) => ({ ...prev, foodPreference: value as Listing['foodPreference'] }))}
            />
            <Field
              label="Description"
              value={form.description}
              onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
              styles={styles}
              multiline
            />

            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.primaryButton, isSaving && styles.disabledButton]} activeOpacity={0.9} onPress={submitListing} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={colors.canvas} /> : <Text style={styles.primaryButtonText}>{editingId ? 'Update listing' : 'Create listing'}</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Your properties</Text>
              {isLoading ? <ActivityIndicator color={colors.blue} /> : null}
            </View>

            {!isLoading && listings.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="home" size={20} color={colors.blue} />
                </View>
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptyText}>Create the first property above. It will appear here as a manageable owner card.</Text>
              </View>
            ) : null}

            {listings.map((listing) => (
              <TouchableOpacity key={listing.id} style={styles.listingCard} activeOpacity={0.92} onPress={() => onOpenListing(listing.id)}>
                <View style={[styles.listingImage, { backgroundColor: listing.imageColor }]}>
                  <Text style={styles.listingStatus}>{listing.isAvailable ? 'Active' : 'Paused'}</Text>
                </View>
                <View style={styles.listingBody}>
                  <View style={styles.listingTitleRow}>
                    <View style={styles.listingTitleWrap}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <Text style={styles.listingMeta} numberOfLines={1}>
                        {listing.locality} | Rs {listing.rent.toLocaleString()} | {listing.availableBeds} beds
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
                  </View>

                  <View style={styles.actionRow}>
                    <CardAction label="Manage" icon="analytics" styles={styles} onPress={() => onOpenListing(listing.id)} />
                    <CardAction label="Edit" icon="create" styles={styles} onPress={() => startEdit(listing)} />
                    <CardAction
                      label={listing.isAvailable ? 'Pause' : 'Resume'}
                      icon={listing.isAvailable ? 'pause' : 'play'}
                      styles={styles}
                      onPress={() => void toggleAvailability(listing)}
                    />
                    <CardAction label="Delete" icon="trash" danger styles={styles} onPress={() => removeListing(listing.id)} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  styles,
  keyboardType,
  multiline = false,
  compact = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  styles: ReturnType<typeof makeStyles>;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[styles.fieldWrap, compact && styles.fieldWrapCompact]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        multiline={multiline}
      />
    </View>
  );
}

function OptionSelector({
  label,
  value,
  options,
  styles,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  styles: ReturnType<typeof makeStyles>;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.optionWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const isActive = value === option;
          return (
            <TouchableOpacity
              key={`${label}-${option}`}
              style={[styles.optionChip, isActive && styles.optionChipActive]}
              activeOpacity={0.9}
              onPress={() => onChange(option)}>
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DashboardStat({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.dashboardStat}>
      <Text style={styles.dashboardValue}>{value}</Text>
      <Text style={styles.dashboardLabel}>{label}</Text>
    </View>
  );
}

function CardAction({
  label,
  icon,
  danger = false,
  styles,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.cardAction, danger && styles.cardActionDanger]} activeOpacity={0.9} onPress={onPress}>
      <Ionicons name={icon} size={14} color={danger ? '#BE123C' : '#1D4ED8'} />
      <Text style={[styles.cardActionText, danger && styles.cardActionTextDanger]}>{label}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerKicker: {
      color: colors.blue,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      marginTop: 2,
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    content: {
      padding: 16,
      paddingBottom: 28,
      gap: 14,
    },
    summaryBand: {
      flexDirection: 'row',
      gap: 8,
    },
    dashboardStat: {
      flex: 1,
      minHeight: 72,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    dashboardValue: {
      color: colors.ink,
      fontSize: 20,
      fontWeight: '900',
    },
    dashboardLabel: {
      marginTop: 3,
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
    },
    formCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 10,
    },
    formHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    formTitleWrap: {
      flex: 1,
    },
    formTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    formSubtitle: {
      marginTop: 3,
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    cancelButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cancelText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    fieldGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    fieldWrap: {
      gap: 6,
    },
    fieldWrapCompact: {
      flex: 1,
    },
    fieldLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    optionWrap: {
      gap: 7,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    optionChipActive: {
      borderColor: colors.blue,
      backgroundColor: colors.blueSoft,
    },
    optionText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    optionTextActive: {
      color: colors.blue,
    },
    fieldInput: {
      height: 44,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      color: colors.ink,
      paddingHorizontal: 12,
      fontSize: 14,
      fontWeight: '700',
    },
    fieldInputMulti: {
      minHeight: 84,
      height: 84,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    errorText: {
      color: colors.rose,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    successText: {
      color: colors.green,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '800',
    },
    primaryButton: {
      marginTop: 2,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
    },
    disabledButton: {
      opacity: 0.65,
    },
    primaryButtonText: {
      color: colors.canvas,
      fontSize: 14,
      fontWeight: '900',
    },
    listSection: {
      gap: 10,
    },
    listHeader: {
      minHeight: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    listTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    listingCard: {
      overflow: 'hidden',
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    listingImage: {
      minHeight: 72,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      padding: 10,
    },
    listingStatus: {
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: '#FFFFFFE6',
      color: '#101828',
      paddingHorizontal: 11,
      paddingVertical: 7,
      fontSize: 11,
      fontWeight: '900',
    },
    listingBody: {
      padding: 12,
      gap: 10,
    },
    listingTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    listingTitleWrap: {
      flex: 1,
      gap: 3,
    },
    listingTitle: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: '900',
    },
    listingMeta: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    cardAction: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    cardActionDanger: {
      borderColor: '#FECACA',
      backgroundColor: '#FFF1F2',
    },
    cardActionText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    cardActionTextDanger: {
      color: colors.rose,
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
    emptyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blueSoft,
    },
    emptyTitle: {
      color: colors.ink,
      fontSize: 17,
      fontWeight: '900',
    },
    emptyText: {
      color: colors.muted,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
    },
  });
