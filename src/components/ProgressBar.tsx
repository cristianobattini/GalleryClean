import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  done: number;
  total: number;
}

export function ProgressBar({ done, total }: Props) {
  const pct = total > 0 ? done / total : 0;

  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct * 100}%` as any, { duration: 300 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <Text style={styles.label}>
        {done} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.keep,
    borderRadius: 2,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    minWidth: 52,
    textAlign: 'right',
  },
});
