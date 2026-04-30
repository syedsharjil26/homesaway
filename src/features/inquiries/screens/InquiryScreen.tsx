import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BookingPayload } from '@/src/data/bookings';
import { Listing } from '@/src/data/listings';
import { useAppStateContext } from '@/src/context/AppStateContext';
import { validateBookingInput } from '@/src/services/bookingService';
import { submitInquiry } from '@/src/services/supabaseInquiries';
import { AppTheme, radii } from '@/src/theme/design';

type InquiryScreenProps = {
  listing: Listing;
  colors: AppTheme;
  onBack: () => void;
  onSubmitSuccess: () => void;
};

type FieldErrors = {
  fullName?: string;
  phoneNumber?: string;
  moveInDate?: string;
  budget?: string;
};

export function InquiryScreen({ listing, colors, onBack, onSubmitSuccess }: InquiryScreenProps) {
  const { profile } = useAppStateContext();
  const styles = makeStyles(colors);
  const [fullName, setFullName] = useState(profile?.fullName.trim() ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone.trim() ?? '');
  const [collegeOrWorkplace, setCollegeOrWorkplace] = useState(profile?.college?.trim() ?? '');
  const [moveInDate, setMoveInDate] = useState('');
  const [budget, setBudget] = useState(String(listing.rent));
  const [foodPreference, setFoodPreference] = useState(listing.foodPreference);
  const [message, setMessage] = useState(`Hi, I want to request a booking for ${listing.title}. Please share availability.`);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const propertyLine = useMemo(() => `${listing.title} | ${listing.locality}, Kolkata`, [listing.locality, listing.title]);

  const handleSubmit = async () => {
    if (!profile) {
      setSubmitError('You need an active profile before sending inquiries.');
      return;
    }

    const payload: BookingPayload = {
      listing,
      requesterName: fullName,
      requesterRole: profile.role,
      phoneNumber,
      collegeOrWorkplace,
      moveInDate,
      budget,
      foodPreference,
      message,
    };

    const validation = validateBookingInput(payload);
    if (validation && !validation.ok) {
      const nextErrors: FieldErrors = {};
      if (validation.message?.toLowerCase().includes('phone')) nextErrors.phoneNumber = validation.message;
      else if (validation.message?.toLowerCase().includes('move-in')) nextErrors.moveInDate = validation.message;
      else if (validation.message?.toLowerCase().includes('budget')) nextErrors.budget = validation.message;
      else nextErrors.fullName = validation.message ?? 'Please fix the highlighted input';
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await submitInquiry(payload, profile.id);
      onSubmitSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={onBack}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking Request</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.propertyCard}>
            <Text style={styles.eyebrow}>Selected PG</Text>
            <Text style={styles.propertyName}>{propertyLine}</Text>
            <Text style={styles.propertyRent}>Rs {listing.rent.toLocaleString()}/month | {listing.foodPreference} food</Text>
          </View>

          <View style={styles.formCard}>
            <FormInput
              colors={colors}
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              error={errors.fullName}
            />
            <FormInput
              colors={colors}
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="10-digit phone number"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />
            <FormInput
              colors={colors}
              label="College / Workplace"
              value={collegeOrWorkplace}
              onChangeText={setCollegeOrWorkplace}
              placeholder="e.g. Jadavpur University"
            />
            <FormInput
              colors={colors}
              label="Move-In Date"
              value={moveInDate}
              onChangeText={setMoveInDate}
              placeholder="e.g. 15 May 2026"
              error={errors.moveInDate}
            />
            <FormInput colors={colors} label="Budget" value={budget} onChangeText={setBudget} placeholder="e.g. 7000" error={errors.budget} />
            <FormInput
              colors={colors}
              label="Food Preference"
              value={foodPreference}
              onChangeText={(value) => setFoodPreference(value as typeof foodPreference)}
              placeholder="Veg / Non-Veg / Both"
            />
            <FormInput colors={colors} label="Message" value={message} onChangeText={setMessage} placeholder="Write your message" multiline />
            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} activeOpacity={0.92} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitText}>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type FormInputProps = {
  colors: AppTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
  multiline?: boolean;
  error?: string;
};

function FormInput({ colors, label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, error }: FormInputProps) {
  const styles = makeStyles(colors);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
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
    content: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 108,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
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
    propertyCard: {
      borderRadius: radii.xl,
      backgroundColor: colors.navy,
      padding: 16,
      marginBottom: 12,
    },
    eyebrow: {
      color: colors.canvas,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    propertyName: {
      marginTop: 8,
      color: colors.canvas,
      fontSize: 18,
      fontWeight: '900',
    },
    propertyRent: {
      marginTop: 5,
      color: colors.canvas,
      fontSize: 14,
      fontWeight: '800',
    },
    formCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 13,
    },
    inputGroup: {
      gap: 7,
    },
    inputLabel: {
      color: colors.ink,
      fontSize: 13,
      fontWeight: '900',
    },
    input: {
      minHeight: 48,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 13,
      color: colors.ink,
      fontSize: 14,
      fontWeight: '600',
    },
    inputMultiline: {
      height: 104,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.rose,
    },
    errorText: {
      color: colors.rose,
      fontSize: 12,
      fontWeight: '700',
    },
    submitError: {
      color: colors.rose,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 10,
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
    },
    submitButton: {
      height: 52,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitText: {
      color: colors.canvas,
      fontSize: 15,
      fontWeight: '900',
    },
  });
