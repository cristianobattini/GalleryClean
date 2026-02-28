import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGallery, GalleryAsset } from '../context/GalleryContext';
import { COLORS } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const THUMB = (W - 48 - 8) / 3;

export function SummaryScreen() {
  const { state, commitDeletes, undo } = useGallery();
  const navigation = useNavigation();
  const [preview, setPreview] = useState<GalleryAsset | null>(null);

  const handleCommit = () => {
    Alert.alert(
      'Elimina definitivamente',
      `Stai per eliminare ${state.toDelete.length} file. Questa azione è irreversibile.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            await commitDeletes();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>RIEPILOGO</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>{state.toDelete.length}</Text>
          <Text style={styles.statLabel}>da eliminare</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.keep }]}>{state.toKeep.length}</Text>
          <Text style={styles.statLabel}>tenute</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.text }]}>
            {state.assets.length - state.currentIndex}
          </Text>
          <Text style={styles.statLabel}>rimanenti</Text>
        </View>
      </View>

      {state.toDelete.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={56} color={COLORS.keep} />
          <Text style={styles.emptyText}>Nessuna foto da eliminare</Text>
        </View>
      ) : (
        <FlatList
          data={state.toDelete}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 4 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setPreview(item)} activeOpacity={0.8}>
              <View style={styles.thumb}>
                <Image source={{ uri: item.uri }} style={styles.thumbImg} />
                {item.mediaType === 'video' && (
                  <View style={styles.videoPill}>
                    <Ionicons name="videocam" size={10} color="#fff" />
                  </View>
                )}
                <View style={styles.deleteIcon}>
                  <Ionicons name="trash" size={12} color={COLORS.accent} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Commit button */}
      {state.toDelete.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleCommit}
            disabled={state.isDeleting}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteBtnText}>
              {state.isDeleting
                ? 'Eliminazione...'
                : `Elimina ${state.toDelete.length} file`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview modal */}
      <Modal visible={!!preview} transparent animationType="fade">
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreview(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {preview && (
            <Image
              source={{ uri: preview.uri }}
              style={styles.previewImg}
              resizeMode="contain"
            />
          )}
          {preview && (
            <Text style={styles.previewName}>{preview.filename}</Text>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
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
  statsRow: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  statNum: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  videoPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 3,
  },
  deleteIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  previewImg: {
    width: W,
    height: W * 1.2,
  },
  previewName: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 12,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
