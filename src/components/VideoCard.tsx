import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { COLORS } from '../constants/theme';

interface Props {
  id: string;
  uri: string;
  duration: number;
}

export function VideoCard({ id, uri, duration }: Props) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playableUri, setPlayableUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(id);
        if (!cancelled) setPlayableUri(info.localUri ?? uri);
      } catch {
        if (!cancelled) setPlayableUri(uri);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
    }
    if (status.didJustFinish) {
      setIsPlaying(false);
      setProgress(0);
      videoRef.current?.setPositionAsync(0);
    }
  };

  if (!playableUri) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: playableUri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={handleStatus}
        isLooping={false}
        isMuted={false}
      />

      {/* Play/Pause overlay */}
      <TouchableOpacity style={styles.playOverlay} onPress={togglePlay} activeOpacity={0.8}>
        {!isPlaying && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={36} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
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
