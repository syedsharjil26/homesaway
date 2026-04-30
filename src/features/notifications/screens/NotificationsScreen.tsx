import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppTheme, radii } from '@/src/theme/design';

type NotificationsScreenProps = {
  colors: AppTheme;
  onBack: () => void;
};

const NOTIFICATIONS = [
  { title: 'Metro Stay rent check', body: 'Sector V homes under Rs 7,500 are moving fastest this week.' },
  { title: 'New verified inventory', body: 'Three listings were marked verified across Ballygunge and Salt Lake.' },
  { title: 'Booking follow-up', body: 'Shortlisted hosts should reply within one business day once backend messaging is connected.' },
  { title: 'Budget signal', body: 'Most saved student homes sit between Rs 5,800 and Rs 7,200 per month.' },
];

export function NotificationsScreen({ colors, onBack }: NotificationsScreenProps) {
  const styles = makeStyles(colors);

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((item) => (
          <View key={item.title} style={styles.card}>
            <View style={styles.dot} />
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        ))}
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
    gap: 10,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
    marginTop: 5,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  body: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
