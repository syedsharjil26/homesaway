import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { promoteProfileToOwner, submitOwnerPgEnquiry } from '@/src/services/ownerAccessService';
import { validateEmail, validatePhone, validatePositiveInteger, validateRequired } from '@/src/services/validationService';
import { getTheme, radii, shadow } from '@/src/theme/design';

export default function OwnerRequestRoute() {
  const router = useRouter();
  const { state, profile, session, refreshProfile } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [propertyName, setPropertyName] = useState('');
  const [locality, setLocality] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [notes, setNotes] = useState('');
  const [existingBusiness, setExistingBusiness] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const styles = makeStyles(colors);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!profile?.id || !session?.user.id) {
      setError('Please sign in again before submitting your request.');
      return;
    }

    const checks = [
      validateRequired('Full name', fullName),
      validateEmail(email),
      validateRequired('Phone', phone),
      validatePhone(phone),
      validateRequired('Property name', propertyName),
      validateRequired('Locality', locality),
      validateRequired('Room count', roomCount),
      validatePositiveInteger('Room count', roomCount),
    ];

    const failing = checks.find((c) => !c.ok);
    if (failing) {
      setError(failing.message || 'Please check your inputs');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await submitOwnerPgEnquiry({
        userId: session.user.id,
        fullName,
        email,
        phone,
        propertyName,
        locality,
        roomCount: Number(roomCount.trim()),
        notes,
        existingBusiness,
      });
      await promoteProfileToOwner(profile, session.user.id);
      await refreshProfile();
      router.replace('/owner/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              activeOpacity={0.9}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Owner Request</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.title}>List Your PG</Text>
          <Text style={styles.subtitle}>Send your property enquiry and continue as an owner.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your full name" />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 phone number" keyboardType="phone-pad" />

            <Text style={styles.label}>Property Name</Text>
            <TextInput style={styles.input} value={propertyName} onChangeText={setPropertyName} placeholder="e.g. Sunrise PG" />

            <Text style={styles.label}>Locality</Text>
            <TextInput style={styles.input} value={locality} onChangeText={setLocality} placeholder="e.g. Ballygunge" />

            <Text style={styles.label}>Number of Rooms</Text>
            <TextInput style={styles.input} value={roomCount} onChangeText={setRoomCount} placeholder="e.g. 10" keyboardType="numeric" />

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput style={[styles.input, styles.notesInput]} value={notes} onChangeText={setNotes} placeholder="Any additional details" multiline />

            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setExistingBusiness(!existingBusiness)} style={styles.checkbox} activeOpacity={0.9}>
                <Text style={existingBusiness ? styles.checkboxChecked : styles.checkboxUnchecked}>{existingBusiness ? '[x]' : '[ ]'}</Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Do you have an existing PG business?</Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color={colors.canvas} /> : <Text style={styles.buttonText}>Continue as Owner</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1 },
    root: { flex: 1, backgroundColor: colors.canvas },
    content: { padding: 20, paddingBottom: 34 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    backButton: {
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    backButtonText: {
      color: colors.ink,
      fontSize: 12,
      fontWeight: '900',
    },
    headerTitle: {
      color: colors.ink,
      fontSize: 17,
      fontWeight: '900',
    },
    headerSpacer: {
      width: 58,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.ink, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.muted, marginBottom: 20, textAlign: 'center' },
    form: { backgroundColor: colors.surface, padding: 20, borderRadius: radii.xl, ...shadow },
    label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 16, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: colors.line, borderRadius: radii.md, padding: 12, fontSize: 16, color: colors.ink },
    notesInput: { minHeight: 86, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    checkbox: { marginRight: 8 },
    checkboxChecked: { fontSize: 18, color: colors.blue },
    checkboxUnchecked: { fontSize: 18, color: colors.muted },
    checkboxLabel: { fontSize: 16, color: colors.ink },
    error: { color: colors.rose, marginTop: 8 },
    button: { backgroundColor: colors.blue, padding: 16, borderRadius: radii.md, alignItems: 'center', marginTop: 20 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: colors.canvas, fontSize: 16, fontWeight: '600' },
  });
