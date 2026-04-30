import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { OwnerInquiryInboxScreen } from '@/src/features/owner/screens/OwnerInquiryInboxScreen';
import { getTheme } from '@/src/theme/design';

export default function OwnerInquiryInboxRoute() {
  const router = useRouter();
  const { state, profile } = useAppStateContext();
  const colors = getTheme(state.themeMode);

  if (profile?.role !== 'owner') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.text, { color: colors.ink }]}>Owner access only</Text>
      </SafeAreaView>
    );
  }

  return <OwnerInquiryInboxScreen onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
    fontWeight: '800',
  },
});
