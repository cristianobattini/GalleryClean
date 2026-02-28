import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  onDelete: () => void;
  onKeep: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function ActionButtons({ onDelete, onKeep, onUndo, canUndo }: Props) {
  const deleteScale = useSharedValue(1);
  const keepScale = useSharedValue(1);
  const undoScale = useSharedValue(1);

  const bounce = (sv: Animated.SharedValue<number>) => {
    sv.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(1.08, { duration: 120 }),
      withTiming(1, { duration: 80 })
    );
  };

  const deleteStyle = useAnimatedStyle(() => ({ transform: [{ scale: deleteScale.value }] }));
  const keepStyle = useAnimatedStyle(() => ({ transform: [{ scale: keepScale.value }] }));
  const undoStyle = useAnimatedStyle(() => ({ transform: [{ scale: undoScale.value }] }));

  return (
    <View style={styles.row}>
      {/* Undo */}
      <Animated.View style={undoStyle}>
        <TouchableOpacity
          style={[styles.btn, styles.undoBtn, !canUndo && styles.disabled]}
          onPress={() => {
            if (!canUndo) return;
            bounce(undoScale);
            onUndo();
          }}
          disabled={!canUndo}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-undo" size={22} color={canUndo ? COLORS.undo : COLORS.textDim} />
        </TouchableOpacity>
      </Animated.View>

      {/* Delete */}
      <Animated.View style={deleteStyle}>
        <TouchableOpacity
          style={[styles.btn, styles.deleteBtn]}
          onPress={() => {
            bounce(deleteScale);
            onDelete();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* Keep */}
      <Animated.View style={keepStyle}>
        <TouchableOpacity
          style={[styles.btn, styles.keepBtn]}
          onPress={() => {
            bounce(keepScale);
            onKeep();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={28} color={COLORS.keep} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  btn: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  deleteBtn: {
    width: 72,
    height: 72,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255,59,59,0.08)',
  },
  keepBtn: {
    width: 72,
    height: 72,
    borderColor: COLORS.keep,
    backgroundColor: 'rgba(0,229,160,0.08)',
  },
  undoBtn: {
    width: 48,
    height: 48,
    borderColor: COLORS.undo,
    backgroundColor: 'rgba(245,166,35,0.08)',
  },
  disabled: {
    borderColor: COLORS.textDim,
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
});
