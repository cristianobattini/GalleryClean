import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGallery, FilterMode, SortMode } from '../context/GalleryContext';
import { COLORS } from '../constants/theme';

export function FilterScreen() {
  const { state, setAlbum, setFilter, setSort } = useGallery();
  const navigation = useNavigation();

  const filterOptions: { label: string; value: FilterMode; icon: string }[] = [
    { label: 'Tutto', value: 'all', icon: 'layers-outline' },
    { label: 'Foto', value: 'photo', icon: 'image-outline' },
    { label: 'Video', value: 'video', icon: 'videocam-outline' },
  ];

  const sortOptions: { label: string; value: SortMode; icon: string }[] = [
    { label: 'Più recenti', value: 'newest', icon: 'arrow-down-outline' },
    { label: 'Più vecchi', value: 'oldest', icon: 'arrow-up-outline' },
    { label: 'Ultima modifica', value: 'size', icon: 'time-outline' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>FILTRI</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Media type */}
        <Text style={styles.sectionLabel}>TIPO DI MEDIA</Text>
        <View style={styles.optionRow}>
          {filterOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                state.filterMode === opt.value && styles.chipActive,
              ]}
              onPress={() => setFilter(opt.value)}
            >
              <Ionicons
                name={opt.icon as any}
                size={18}
                color={state.filterMode === opt.value ? COLORS.bg : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.chipText,
                  state.filterMode === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort */}
        <Text style={styles.sectionLabel}>ORDINA PER</Text>
        <View style={styles.optionRow}>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                state.sortMode === opt.value && styles.chipActiveYellow,
              ]}
              onPress={() => setSort(opt.value)}
            >
              <Ionicons
                name={opt.icon as any}
                size={18}
                color={state.sortMode === opt.value ? COLORS.bg : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.chipText,
                  state.sortMode === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Albums */}
        <Text style={styles.sectionLabel}>ALBUM</Text>
        {/* All option */}
        <TouchableOpacity
          style={[styles.albumRow, state.selectedAlbum === null && styles.albumRowActive]}
          onPress={() => setAlbum(null)}
        >
          <Ionicons
            name="albums-outline"
            size={20}
            color={state.selectedAlbum === null ? COLORS.keep : COLORS.textMuted}
          />
          <Text style={[styles.albumText, state.selectedAlbum === null && { color: COLORS.keep }]}>
            Tutti i media
          </Text>
          {state.selectedAlbum === null && (
            <Ionicons name="checkmark" size={18} color={COLORS.keep} style={{ marginLeft: 'auto' }} />
          )}
        </TouchableOpacity>

        {state.albums.map((album) => (
          <TouchableOpacity
            key={album.id}
            style={[styles.albumRow, state.selectedAlbum === album.id && styles.albumRowActive]}
            onPress={() => setAlbum(album.id)}
          >
            <Ionicons
              name="folder-outline"
              size={20}
              color={state.selectedAlbum === album.id ? COLORS.keep : COLORS.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.albumText,
                  state.selectedAlbum === album.id && { color: COLORS.keep },
                ]}
              >
                {album.title}
              </Text>
              <Text style={styles.albumCount}>{album.assetCount} elementi</Text>
            </View>
            {state.selectedAlbum === album.id && (
              <Ionicons name="checkmark" size={18} color={COLORS.keep} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  title: {
    flex: 1,
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 4,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.keep,
    borderColor: COLORS.keep,
  },
  chipActiveYellow: {
    backgroundColor: COLORS.undo,
    borderColor: COLORS.undo,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.bg,
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  albumRowActive: {
    borderColor: COLORS.keep,
    backgroundColor: 'rgba(0,229,160,0.06)',
  },
  albumText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  albumCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
