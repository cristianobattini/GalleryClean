import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useGallery } from '../context/GalleryContext';
import { SwipableCard } from '../components/SwipableCard';
import { ActionButtons } from '../components/ActionButtons';
import { ProgressBar } from '../components/ProgressBar';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../navigation/MainNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'Swipe'>;
const { width: W } = Dimensions.get('window');

export function SwipeScreen() {
  const { state, swipeDelete, swipeKeep, undo, currentAsset, progress } = useGallery();
  const navigation = useNavigation<Nav>();

  const isDone = state.currentIndex >= state.assets.length && !state.isLoading;

  if (!state.hasPermission && !state.isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Nessun accesso</Text>
        <Text style={styles.emptySubtitle}>
          Abilita l'accesso alla libreria foto nelle impostazioni.
        </Text>
      </SafeAreaView>
    );
  }

  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.keep} />
        <Text style={styles.loadingText}>Caricamento galleria...</Text>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="checkmark-circle-outline" size={72} color={COLORS.keep} />
        <Text style={styles.emptyTitle}>Tutto revisionato!</Text>
        <Text style={styles.emptySubtitle}>
          {state.toDelete.length > 0
            ? `${state.toDelete.length} foto da eliminare`
            : 'Nessuna foto da eliminare'}
        </Text>
        {state.toDelete.length > 0 && (
          <TouchableOpacity
            style={styles.summaryBtn}
            onPress={() => navigation.navigate('Summary')}
          >
            <Text style={styles.summaryBtnText}>Vedi riepilogo</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // Next card (preloaded behind current)
  const nextAsset = state.assets[state.currentIndex + 1] ?? null;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>CLEAN</Text>
        <View style={styles.headerRight}>
          {state.toDelete.length > 0 && (
            <TouchableOpacity
              style={styles.summaryPill}
              onPress={() => navigation.navigate('Summary')}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.accent} />
              <Text style={styles.summaryPillText}>{state.toDelete.length}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Filter')} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress */}
      <ProgressBar done={progress.done} total={progress.total} />

      {/* Cards stack */}
      <View style={styles.cardArea}>
        {/* Background card */}
        {nextAsset && (
          <View style={[styles.cardWrapper, styles.bgCard]}>
            <SwipableCard
              key={`bg-${nextAsset.id}`}
              asset={nextAsset}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              isActive={false}
            />
          </View>
        )}

        {/* Active card */}
        {currentAsset && (
          <View style={styles.cardWrapper}>
            <SwipableCard
              key={currentAsset.id}
              asset={currentAsset}
              onSwipeLeft={swipeKeep}
              onSwipeRight={swipeDelete}
              isActive={true}
            />
          </View>
        )}
      </View>

      {/* Hint labels */}
      <View style={styles.hints}>
        <View style={styles.hintLeft}>
          <Ionicons name="arrow-back" size={14} color={COLORS.keep} />
          <Text style={[styles.hintText, { color: COLORS.keep }]}>TIENI</Text>
        </View>
        <View style={styles.hintRight}>
          <Text style={[styles.hintText, { color: COLORS.accent }]}>ELIMINA</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
        </View>
      </View>

      {/* Action buttons */}
      <ActionButtons
        onDelete={swipeDelete}
        onKeep={swipeKeep}
        onUndo={undo}
        canUndo={state.history.length > 0}
      />

      {/* Asset filename */}
      {currentAsset && (
        <Text style={styles.filename} numberOfLines={1}>
          {currentAsset.filename}
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    gap: 12,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  appName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,59,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  summaryPillText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  bgCard: {
    top: 8,
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  filename: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  summaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  summaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
