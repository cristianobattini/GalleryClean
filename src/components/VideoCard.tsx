import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { COLORS } from '../constants/theme';

interface Props {
  id: string;
  uri: string;
  duration: number;
}

export function VideoCard({ id, uri, duration }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Resolve localUri (file://) from ph:// asset URI
  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    (async () => {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(id);
        const resolvedUri = info.localUri ?? uri;
        if (!cancelled) {
          player.replace({ uri: resolvedUri });
          setReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          player.replace({ uri });
          setReady(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id, player]);

  useEffect(() => {
    if (!player || !player.addListener) return;
    const sub = player.addListener('playingChange', (playing) => {
      setIsPlaying(playing);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (!player || !player.addListener) return;
    const sub = player.addListener('playToEnd', () => {
      setIsPlaying(false);
      setProgress(0);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      try {
        if (player.duration > 0) {
          setProgress(player.currentTime / player.duration);
        }
      } catch (e) {}
    }, 250);
    return () => clearInterval(interval);
  }, [player]);

  // Pause when card is unmounted (swiped away)
  useEffect(() => {
    if (!player) return;
    return () => { try { player.pause(); } catch {} };
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      try { player.pause(); } catch {}
    } else {
      try { player.play(); } catch {}
    }
  };

  if (!ready) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <TapGestureHandler
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE) togglePlay();
      }}
    >
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
        />

        {!isPlaying && (
          <View style={styles.playOverlay} pointerEvents="none">
            <View style={styles.playButton}>
              <Ionicons name="play" size={36} color="#fff" />
            </View>
          </View>
        )}

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.keep,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
