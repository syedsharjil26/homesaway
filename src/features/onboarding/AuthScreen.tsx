import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { validateEmail, validatePhone, validateRequired } from '@/src/services/validationService';
import { AppTheme, radii, shadow } from '@/src/theme/design';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  colors: AppTheme;
};

function validatePassword(password: string) {
  if (password.trim().length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters' };
  }
  return { ok: true };
}

export function AuthScreen({ colors }: AuthScreenProps) {
  const { signIn, signUp, actionLoading, error } = useAppStateContext();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');

  const styles = makeStyles(colors);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!mode || actionLoading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const baseChecks = [validateRequired('Email', normalizedEmail), validateEmail(normalizedEmail), validatePassword(password)];
    const signUpChecks = [
      validateRequired('Full name', fullName),
      validateRequired('Phone', normalizedPhone),
      validatePhone(normalizedPhone),
    ];

    const failingCheck = [...(mode === 'signup' ? signUpChecks : []), ...baseChecks].find((check) => !check.ok);
    if (failingCheck) {
      setFormError(failingCheck.message ?? 'Please review your details');
      return;
    }

    setFormError('');
    setNotice('');

    if (mode === 'signup') {
      const result = await signUp({
        email: normalizedEmail,
        password,
        fullName,
        phone: normalizedPhone,
      });

      if ('error' in result && result.error) {
        return;
      }

      if (result.data?.session) {
        return;
      }

      setNotice('Check your email to confirm the account, then sign in.');
      return;
    }

    await signIn({
      email: normalizedEmail,
      password,
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.wrap}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
            <Text style={styles.brand}>HomesAway</Text>
            <Text style={styles.subtitle}>Find a Home Away From Home</Text>

            <View style={styles.formCard}>
              {!mode ? (
                <View style={styles.entryActions}>
                  {(['login', 'signup'] as const).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.entryButton, item === 'signup' && styles.entryButtonSecondary]}
                      activeOpacity={0.92}
                      onPress={() => {
                        setFormError('');
                        setNotice('');
                        setMode(item);
                      }}>
                      <Text style={[styles.entryButtonText, item === 'signup' && styles.entryButtonTextSecondary]}>
                        {item === 'login' ? 'Login' : 'Sign Up'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <>
                  <View style={styles.modeHeader}>
                    <Text style={styles.modeTitle}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
                    <TouchableOpacity
                      style={styles.switchModeButton}
                      onPress={() => {
                        setMode(null);
                        setFormError('');
                        setNotice('');
                      }}
                      activeOpacity={0.9}>
                      <Text style={styles.switchModeText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  {mode === 'signup' ? (
                    <>
                      <Text style={styles.inputLabel}>Full name</Text>
                      <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Your name"
                        placeholderTextColor={colors.subtle}
                        style={styles.input}
                      />
                      <Text style={styles.inputLabel}>Phone</Text>
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+91 phone number"
                        placeholderTextColor={colors.subtle}
                        keyboardType="phone-pad"
                        style={styles.input}
                      />
                    </>
                  ) : null}

                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.subtle}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                  />

                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.subtle}
                    secureTextEntry
                    autoCapitalize="none"
                    style={styles.input}
                  />

                  {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                  {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

                  <TouchableOpacity style={styles.button} activeOpacity={0.92} onPress={handleSubmit} disabled={actionLoading}>
                    <Text style={styles.buttonText}>
                      {actionLoading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    scrollContent: {
      flexGrow: 1,
      paddingVertical: 20,
    },
    wrap: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    logo: {
      width: 76,
      height: 76,
      marginBottom: 12,
      alignSelf: 'center',
    },
    brand: {
      color: colors.ink,
      fontSize: 34,
      fontWeight: '900',
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 10,
      color: colors.muted,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      textAlign: 'center',
    },
    formCard: {
      marginTop: 24,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      padding: 20,
      gap: 12,
      ...shadow,
    },
    entryActions: {
      gap: 12,
    },
    entryButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    entryButtonSecondary: {
      backgroundColor: colors.blueSoft,
      borderWidth: 1,
      borderColor: colors.line,
    },
    entryButtonText: {
      color: colors.canvas,
      fontSize: 16,
      fontWeight: '900',
    },
    entryButtonTextSecondary: {
      color: colors.navy,
    },
    modeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modeTitle: {
      color: colors.ink,
      fontSize: 17,
      fontWeight: '900',
    },
    switchModeButton: {
      borderRadius: 999,
      backgroundColor: colors.blueSoft,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    switchModeText: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: '900',
    },
    inputLabel: {
      color: colors.ink,
      fontSize: 13,
      fontWeight: '900',
    },
    input: {
      height: 50,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      color: colors.ink,
      fontSize: 15,
      fontWeight: '600',
    },
    errorText: {
      color: colors.rose,
      fontSize: 12,
      fontWeight: '700',
    },
    noticeText: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: '700',
    },
    button: {
      marginTop: 4,
      height: 52,
      borderRadius: radii.lg,
      backgroundColor: colors.navy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.canvas,
      fontSize: 15,
      fontWeight: '900',
    },
  });
