import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppTheme, radii } from '@/src/theme/design';

type ListingFiltersProps = {
  searchQuery: string;
  selectedLocality: string;
  selectedFoodPreference: string;
  maxRent: string;
  localities: readonly string[];
  foodPreferences: readonly string[];
  colors: AppTheme;
  onSearchChange: (value: string) => void;
  onLocalityChange: (area: string) => void;
  onFoodPreferenceChange: (preference: string) => void;
  onMaxRentChange: (value: string) => void;
};

export function ListingFilters({
  searchQuery,
  selectedLocality,
  selectedFoodPreference,
  maxRent,
  localities,
  foodPreferences,
  colors,
  onSearchChange,
  onLocalityChange,
  onFoodPreferenceChange,
  onMaxRentChange,
}: ListingFiltersProps) {
  const styles = makeStyles(colors);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search by property or area"
        placeholderTextColor={colors.subtle}
        style={styles.searchInput}
      />

      <TextInput
        value={maxRent}
        onChangeText={onMaxRentChange}
        placeholder="Max rent, e.g. 7000"
        placeholderTextColor={colors.subtle}
        keyboardType="number-pad"
        style={styles.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {localities.map((area) => {
          const isActive = area === selectedLocality;
          return (
            <TouchableOpacity
              key={area}
              activeOpacity={0.9}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onLocalityChange(area)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{area}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {foodPreferences.map((preference) => {
          const isActive = preference === selectedFoodPreference;
          return (
            <TouchableOpacity
              key={preference}
              activeOpacity={0.9}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onFoodPreferenceChange(preference)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{preference}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
  wrap: {
    gap: 12,
    marginBottom: 14,
  },
  searchInput: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  chipsWrap: {
    gap: 10,
    paddingRight: 16,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.navy,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  chipTextActive: {
    color: colors.canvas,
  },
});
