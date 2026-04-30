import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import { useAppStateContext } from '@/src/context/AppStateContext';
import { OwnerListingsScreen } from '@/src/features/owner/screens/OwnerListingsScreen';
import { getTheme } from '@/src/theme/design';

export default function OwnerListingsRoute() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { state, profile } = useAppStateContext();
  const colors = getTheme(state.themeMode);
  const initialEditId = Array.isArray(editId) ? editId[0] : editId;

  if (profile?.role !== 'owner') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.text, { color: colors.ink }]}>Owner access only</Text>
      </SafeAreaView>
    );
  }

  return (
    <OwnerListingsScreen
      initialEditId={initialEditId}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      onOpenInbox={() => router.push('/owner/inquiries')}
      onOpenListing={(listingId) => router.push({ pathname: '/owner/listing/[id]', params: { id: listingId } })}
      onSubmitSuccess={() => router.replace('/owner/listings')}
    />
  );
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
