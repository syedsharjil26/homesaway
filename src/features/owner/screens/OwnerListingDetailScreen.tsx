import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { Listing } from '@/src/data/listings';
import type { InquiryStatus } from '@/src/services/supabaseInquiries';
import { AppTheme, radii } from '@/src/theme/design';
import type { OwnerListingControls, OwnerListingManagementDetail, OwnerListingStatus } from '@/src/types/owner';

type OwnerListingDetailScreenProps = {
  detail: OwnerListingManagementDetail;
  colors: AppTheme;
  isBusy: boolean;
  error: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onUpdateRent: (rent: number) => Promise<void>;
  onRotateCover: () => Promise<void>;
  onTogglePaused: () => Promise<void>;
  onUpdateControls: (controls: OwnerListingControls) => Promise<void>;
  onUpdateInquiryStatus: (inquiryId: string, status: InquiryStatus) => Promise<void>;
};

const STATUS_STYLES: Record<OwnerListingStatus, 'green' | 'amber' | 'rose' | 'blue'> = {
  Active: 'green',
  Paused: 'amber',
  Full: 'rose',
  Draft: 'blue',
};

const GENDER_OPTIONS: Listing['genderType'][] = ['Boys', 'Girls', 'Unisex'];

export function OwnerListingDetailScreen({
  detail,
  colors,
  isBusy,
  error,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
  onUpdateRent,
  onRotateCover,
  onTogglePaused,
  onUpdateControls,
  onUpdateInquiryStatus,
}: OwnerListingDetailScreenProps) {
  const styles = makeStyles(colors);
  const { listing, status, performance, controls, insights, inquiries } = detail;
  const [isRentEditorOpen, setIsRentEditorOpen] = useState(false);
  const [rentDraft, setRentDraft] = useState(String(listing.rent));
  const [controlsDraft, setControlsDraft] = useState(controls);
  const maxViews = Math.max(...performance.last7DaysViews, 1);

  useEffect(() => {
    setRentDraft(String(listing.rent));
  }, [listing.rent]);

  useEffect(() => {
    setControlsDraft(controls);
  }, [controls]);

  const statusTone = STATUS_STYLES[status];
  const pauseLabel = status === 'Paused' ? 'Resume Listing' : 'Pause Listing';
  const conversionText = `${performance.conversionRate.toFixed(1)}%`;

  const handleDelete = () => {
    Alert.alert('Delete listing', 'This listing and its owner dashboard record will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void onDelete();
        },
      },
    ]);
  };

  const handleSaveRent = () => {
    const nextRent = Number(rentDraft.trim());
    if (!Number.isFinite(nextRent) || nextRent <= 0) {
      Alert.alert('Enter a valid rent', 'Rent should be a positive monthly amount.');
      return;
    }

    void onUpdateRent(nextRent).then(() => setIsRentEditorOpen(false));
  };

  const updateControls = (nextControls: OwnerListingControls) => {
    setControlsDraft(nextControls);
    void onUpdateControls(nextControls);
  };

  const inquiryActions = useMemo(
    () =>
      [
        { label: 'Approve', status: 'approved' as InquiryStatus },
        { label: 'Reject', status: 'rejected' as InquiryStatus },
        { label: 'Mark Contacted', status: 'contacted' as InquiryStatus },
        { label: 'Mark Booked', status: 'booked' as InquiryStatus },
      ],
    []
  );

  return (
    <View style={styles.root}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.roundButton} activeOpacity={0.9} onPress={onBack}>
          <Ionicons name="chevron-back" size={18} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerKicker}>Owner Listing</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Manage property
          </Text>
        </View>
        <TouchableOpacity style={styles.roundButton} activeOpacity={0.9} onPress={() => void onRefresh()}>
          {isBusy ? <ActivityIndicator size="small" color={colors.blue} /> : <Ionicons name="refresh" size={18} color={colors.ink} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Update needs attention</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.headerCard}>
          <View style={[styles.coverImage, { backgroundColor: listing.imageColor }]}>
            <View style={styles.coverTopRow}>
              <Text style={styles.coverPill}>{listing.locality}</Text>
              <Text style={[styles.statusBadge, styles[`${statusTone}Badge`]]}>{status}</Text>
            </View>
            <View style={styles.coverBottom}>
              <Text style={styles.coverTitle} numberOfLines={2}>
                {listing.title}
              </Text>
              <Text style={styles.coverMeta}>
                {listing.roomType} room | {listing.availableBeds} beds open
              </Text>
            </View>
          </View>

          <View style={styles.listingFacts}>
            <Fact label="Rent" value={`Rs ${listing.rent.toLocaleString()}`} styles={styles} />
            <Fact label="Deposit" value={`Rs ${listing.deposit.toLocaleString()}`} styles={styles} />
            <Fact label="Food" value={listing.foodPreference} styles={styles} />
            <Fact label="Gender" value={listing.genderType} styles={styles} />
          </View>
        </View>

        <Section title="Performance Snapshot" subtitle="Owner signals from views and inquiry activity" styles={styles}>
          <View style={styles.metricGrid}>
            <Metric label="Total Views" value={performance.totalViews.toLocaleString()} icon="eye" styles={styles} />
            <Metric label="Favorites" value={performance.favorites.toLocaleString()} icon="heart" styles={styles} />
            <Metric label="Inquiries" value={performance.inquiries.toLocaleString()} icon="chatbubble-ellipses" styles={styles} />
            <Metric label="Conversion" value={conversionText} icon="trending-up" styles={styles} />
          </View>
          <View style={styles.weekRow}>
            <View>
              <Text style={styles.weekLabel}>Last 7 days views</Text>
              <Text style={styles.weekValue}>{performance.last7DaysViews.reduce((sum, views) => sum + views, 0).toLocaleString()}</Text>
            </View>
            <View style={styles.sparkRow}>
              {performance.last7DaysViews.map((views, index) => (
                <View key={`view-${index}`} style={styles.sparkColumn}>
                  <View style={[styles.sparkBar, { height: 18 + (views / maxViews) * 42 }]} />
                </View>
              ))}
            </View>
          </View>
        </Section>

        <Section title="Quick Actions" subtitle="High-frequency owner controls" styles={styles}>
          <View style={styles.actionGrid}>
            <ActionButton label="Edit Listing" icon="create" styles={styles} onPress={onEdit} />
            <ActionButton label="Update Rent" icon="cash" styles={styles} onPress={() => setIsRentEditorOpen((value) => !value)} />
            <ActionButton label="Manage Photos" icon="images" styles={styles} onPress={() => void onRotateCover()} disabled={isBusy} />
            <ActionButton label="Change Availability" icon="calendar" styles={styles} onPress={onEdit} />
            <ActionButton label={pauseLabel} icon={status === 'Paused' ? 'play' : 'pause'} styles={styles} onPress={() => void onTogglePaused()} disabled={isBusy} />
            <ActionButton label="Delete Listing" icon="trash" tone="danger" styles={styles} onPress={handleDelete} disabled={isBusy} />
          </View>

          {isRentEditorOpen ? (
            <View style={styles.inlineEditor}>
              <Text style={styles.inlineLabel}>Monthly rent</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  value={rentDraft}
                  onChangeText={setRentDraft}
                  keyboardType="number-pad"
                  style={styles.inlineInput}
                  placeholder="Rent"
                  placeholderTextColor={colors.subtle}
                />
                <TouchableOpacity style={styles.inlineButton} activeOpacity={0.9} onPress={handleSaveRent} disabled={isBusy}>
                  <Text style={styles.inlineButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Section>

        <Section title="Inquiry Management" subtitle={`${inquiries.length} student leads for this listing`} styles={styles}>
          {inquiries.length === 0 ? (
            <EmptyState
              title="No inquiries yet"
              body="New student messages will appear here with move-in details and owner action buttons."
              icon="mail-open"
              styles={styles}
            />
          ) : (
            <View style={styles.inquiryList}>
              {inquiries.map((inquiry) => (
                <View key={inquiry.id} style={styles.inquiryCard}>
                  <View style={styles.inquiryHeader}>
                    <View style={styles.inquiryNameWrap}>
                      <Text style={styles.inquiryName}>{inquiry.fullName || 'Student lead'}</Text>
                      <Text style={styles.inquiryMeta}>{maskPhone(inquiry.phone)}</Text>
                    </View>
                    <Text style={styles.inquiryStatus}>{formatStatus(inquiry.status)}</Text>
                  </View>
                  <Text style={styles.inquiryMeta}>Move-in: {inquiry.moveInDate || 'Not shared'}</Text>
                  {inquiry.message ? <Text style={styles.inquiryMessage}>{inquiry.message}</Text> : null}
                  <View style={styles.inquiryActionRow}>
                    {inquiryActions.map((action) => {
                      const isActive = inquiry.status === action.status;
                      return (
                        <TouchableOpacity
                          key={`${inquiry.id}-${action.status}`}
                          style={[styles.inquiryAction, isActive && styles.inquiryActionActive]}
                          activeOpacity={0.9}
                          disabled={isBusy}
                          onPress={() => void onUpdateInquiryStatus(inquiry.id, action.status)}>
                          <Text style={[styles.inquiryActionText, isActive && styles.inquiryActionTextActive]}>{action.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section title="Listing Controls" subtitle="Operational preferences students care about" styles={styles}>
          <ControlSwitch
            label="Food options"
            value={controlsDraft.hasFoodOptions}
            styles={styles}
            colors={colors}
            onValueChange={(value) => updateControls({ ...controlsDraft, hasFoodOptions: value })}
          />
          <ControlSwitch
            label="Furnished"
            value={controlsDraft.isFurnished}
            styles={styles}
            colors={colors}
            onValueChange={(value) => updateControls({ ...controlsDraft, isFurnished: value })}
          />
          <ControlSwitch
            label="Smoking allowed"
            value={controlsDraft.smokingAllowed}
            styles={styles}
            colors={colors}
            onValueChange={(value) => updateControls({ ...controlsDraft, smokingAllowed: value })}
          />
          <View style={styles.docsRow}>
            <Text style={styles.controlLabel}>Verified docs</Text>
            <Text style={[styles.docsBadge, controlsDraft.verifiedDocs ? styles.docsBadgeVerified : styles.docsBadgePending]}>
              {controlsDraft.verifiedDocs ? 'Verified' : 'Pending'}
            </Text>
          </View>
          <View style={styles.genderBlock}>
            <Text style={styles.controlLabel}>Gender preference</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((option) => {
                const isActive = controlsDraft.genderPreference === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.genderChip, isActive && styles.genderChipActive]}
                    activeOpacity={0.9}
                    onPress={() => updateControls({ ...controlsDraft, genderPreference: option })}>
                    <Text style={[styles.genderText, isActive && styles.genderTextActive]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Section>

        <Section title="Insights" subtitle="Simple read on demand quality" styles={styles}>
          <View style={styles.insightRow}>
            <Insight label="Most views day" value={insights.mostViewsDay} styles={styles} />
            <Insight label="Demand level" value={insights.demandLevel} styles={styles} />
            <Insight label="Avg response" value={insights.avgResponseTime} styles={styles} />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  subtitle,
  styles,
  children,
}: {
  title: string;
  subtitle: string;
  styles: ReturnType<typeof makeStyles>;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

function Fact({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.factCard}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Metric({
  label,
  value,
  icon,
  styles,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={16} color="#1D4ED8" />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  tone = 'default',
  disabled,
  styles,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, tone === 'danger' && styles.actionButtonDanger, disabled && styles.disabledButton]}
      activeOpacity={0.9}
      disabled={disabled}
      onPress={onPress}>
      <Ionicons name={icon} size={17} color={tone === 'danger' ? '#BE123C' : '#1D4ED8'} />
      <Text style={[styles.actionLabel, tone === 'danger' && styles.actionLabelDanger]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ControlSwitch({
  label,
  value,
  colors,
  styles,
  onValueChange,
}: {
  label: string;
  value: boolean;
  colors: AppTheme;
  styles: ReturnType<typeof makeStyles>;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.blueSoft }}
        thumbColor={value ? colors.blue : colors.subtle}
      />
    </View>
  );
}

function Insight({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

function EmptyState({
  title,
  body,
  icon,
  styles,
}: {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={19} color="#1D4ED8" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) {
    return phone || 'Phone not shared';
  }

  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
}

function formatStatus(status: InquiryStatus) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      backgroundColor: colors.canvas,
    },
    roundButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    headerCopy: {
      flex: 1,
    },
    headerKicker: {
      color: colors.blue,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    headerTitle: {
      marginTop: 2,
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 14,
    },
    errorCard: {
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.rose,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 4,
    },
    errorTitle: {
      color: colors.rose,
      fontSize: 13,
      fontWeight: '900',
    },
    errorText: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },
    headerCard: {
      overflow: 'hidden',
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    coverImage: {
      minHeight: 224,
      justifyContent: 'space-between',
      padding: 14,
    },
    coverTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    coverPill: {
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: '#FFFFFFE6',
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: '#0F172A',
      fontSize: 12,
      fontWeight: '900',
    },
    statusBadge: {
      overflow: 'hidden',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 12,
      fontWeight: '900',
    },
    greenBadge: {
      backgroundColor: colors.greenSoft,
      color: colors.green,
    },
    amberBadge: {
      backgroundColor: colors.amberSoft,
      color: colors.amber,
    },
    roseBadge: {
      backgroundColor: '#FFE4E6',
      color: colors.rose,
    },
    blueBadge: {
      backgroundColor: colors.blueSoft,
      color: colors.blue,
    },
    coverBottom: {
      borderRadius: radii.lg,
      backgroundColor: '#FFFFFFE8',
      padding: 14,
      gap: 4,
    },
    coverTitle: {
      color: '#101828',
      fontSize: 25,
      lineHeight: 30,
      fontWeight: '900',
    },
    coverMeta: {
      color: '#475467',
      fontSize: 13,
      fontWeight: '800',
    },
    listingFacts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 12,
    },
    factCard: {
      flexGrow: 1,
      flexBasis: '47%',
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 11,
      minHeight: 66,
      justifyContent: 'center',
    },
    factLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    factValue: {
      marginTop: 4,
      color: colors.ink,
      fontSize: 16,
      fontWeight: '900',
    },
    section: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 12,
    },
    sectionHeader: {
      gap: 3,
    },
    sectionTitle: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: '900',
    },
    sectionSubtitle: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    metricCard: {
      flexGrow: 1,
      flexBasis: '47%',
      minHeight: 106,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 12,
      justifyContent: 'space-between',
    },
    metricIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blueSoft,
    },
    metricValue: {
      color: colors.ink,
      fontSize: 21,
      fontWeight: '900',
    },
    metricLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    weekRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      borderRadius: radii.md,
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.line,
      padding: 12,
    },
    weekLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
    },
    weekValue: {
      marginTop: 4,
      color: colors.ink,
      fontSize: 20,
      fontWeight: '900',
    },
    sparkRow: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 5,
    },
    sparkColumn: {
      width: 9,
      height: 64,
      justifyContent: 'flex-end',
      borderRadius: 5,
      backgroundColor: colors.blueSoft,
      overflow: 'hidden',
    },
    sparkBar: {
      width: '100%',
      borderRadius: 5,
      backgroundColor: colors.blue,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionButton: {
      flexGrow: 1,
      flexBasis: '47%',
      minHeight: 58,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 11,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButtonDanger: {
      borderColor: '#FECACA',
      backgroundColor: '#FFF1F2',
    },
    disabledButton: {
      opacity: 0.55,
    },
    actionLabel: {
      flex: 1,
      color: colors.ink,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: '900',
    },
    actionLabelDanger: {
      color: colors.rose,
    },
    inlineEditor: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 12,
      gap: 8,
    },
    inlineLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '900',
    },
    inlineRow: {
      flexDirection: 'row',
      gap: 8,
    },
    inlineInput: {
      flex: 1,
      height: 46,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      color: colors.ink,
      paddingHorizontal: 12,
      fontSize: 15,
      fontWeight: '800',
    },
    inlineButton: {
      minWidth: 78,
      height: 46,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.navy,
      paddingHorizontal: 12,
    },
    inlineButtonText: {
      color: colors.canvas,
      fontSize: 13,
      fontWeight: '900',
    },
    inquiryList: {
      gap: 10,
    },
    inquiryCard: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 12,
      gap: 8,
    },
    inquiryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    inquiryNameWrap: {
      flex: 1,
    },
    inquiryName: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: '900',
    },
    inquiryStatus: {
      alignSelf: 'flex-start',
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: colors.blueSoft,
      color: colors.blue,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 11,
      fontWeight: '900',
    },
    inquiryMeta: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    inquiryMessage: {
      color: colors.ink,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
    },
    inquiryActionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    inquiryAction: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 11,
      paddingVertical: 8,
    },
    inquiryActionActive: {
      borderColor: colors.blue,
      backgroundColor: colors.blueSoft,
    },
    inquiryActionText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    inquiryActionTextActive: {
      color: colors.blue,
    },
    controlRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
    },
    controlLabel: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: '900',
    },
    docsRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      paddingHorizontal: 12,
    },
    docsBadge: {
      overflow: 'hidden',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 12,
      fontWeight: '900',
    },
    docsBadgeVerified: {
      backgroundColor: colors.greenSoft,
      color: colors.green,
    },
    docsBadgePending: {
      backgroundColor: colors.amberSoft,
      color: colors.amber,
    },
    genderBlock: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 12,
      gap: 10,
    },
    genderRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    genderChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },
    genderChipActive: {
      borderColor: colors.blue,
      backgroundColor: colors.blueSoft,
    },
    genderText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    genderTextActive: {
      color: colors.blue,
    },
    insightRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    insightCard: {
      flexGrow: 1,
      flexBasis: '31%',
      minHeight: 78,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 10,
      justifyContent: 'center',
    },
    insightLabel: {
      color: colors.muted,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '800',
    },
    insightValue: {
      marginTop: 5,
      color: colors.ink,
      fontSize: 15,
      fontWeight: '900',
    },
    emptyState: {
      alignItems: 'center',
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevated,
      padding: 18,
      gap: 7,
    },
    emptyIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blueSoft,
    },
    emptyTitle: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: '900',
    },
    emptyBody: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      fontWeight: '700',
    },
  });
