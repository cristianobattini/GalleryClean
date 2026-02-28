import React, { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'react-native';
import { COLORS, SWIPE_THRESHOLD } from '../constants/theme';
import { GalleryAsset } from '../context/GalleryContext';
import { VideoCard } from './VideoCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;

interface Props {
  asset: GalleryAsset;
  onSwipeLeft: () => void;   // keep
  onSwipeRight: () => void;  // delete
  isActive: boolean;
}

export function SwipableCard({ asset, onSwipeLeft, onSwipeRight, isActive }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.92);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.92, { damping: 15 });
  }, [isActive]);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {},
    onActive: (event) => {
      if (!isActive) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    },
    onEnd: (event) => {
      if (!isActive) return;
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right → DELETE
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → KEEP
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0, { damping: 14 });
        translateY.value = withSpring(0, { damping: 14 });
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12]
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Delete overlay (swipe right)
  const deleteOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.3, 0.85],
      'clamp'
    );
    return { opacity };
  });

  // Keep overlay (swipe left)
  const keepOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [0.85, 0.3, 0],
      'clamp'
    );
    return { opacity };
  });

  // Border glow
  const borderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [COLORS.keep, 'transparent', COLORS.accent]
    );
    const borderWidth = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 2.5],
      'clamp'
    );
    return { borderColor, borderWidth };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isActive}>
      <Animated.View style={[styles.card, cardStyle, borderStyle]}>
        {/* Media */}
        {asset.mediaType === 'video' ? (
          <VideoCard uri={asset.uri} duration={asset.duration ?? 0} />
        ) : (
          <Image
            source={{ uri: asset.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* DELETE overlay */}
        <Animated.View style={[styles.overlay, styles.deleteOverlay, deleteOverlayStyle]}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: COLORS.accent }]}>ELIMINA</Text>
          </View>
        </Animated.View>

        {/* KEEP overlay */}
        <Animated.View style={[styles.overlay, styles.keepOverlay, keepOverlayStyle]}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: COLORS.keep }]}>TIENI</Text>
          </View>
        </Animated.View>

        {/* Media type badge */}
        {asset.mediaType === 'video' && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>
              {formatDuration(asset.duration ?? 0)}
            </Text>
          </View>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    padding: 24,
  },
  deleteOverlay: {
    backgroundColor: 'rgba(255, 59, 59, 0.2)',
    alignItems: 'flex-start',
  },
  keepOverlay: {
    backgroundColor: 'rgba(0, 229, 160, 0.2)',
    alignItems: 'flex-end',
  },
  labelContainer: {
    borderWidth: 2.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderColor: 'currentColor',
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
