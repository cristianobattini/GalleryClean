import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView } from 'expo-video';
import type { VideoPlayer } from 'expo-video';

interface Props {
  player: VideoPlayer;
}

// VideoCard è solo un wrapper di VideoView.
// Il player viene creato UNA VOLTA in SwipeScreen e riutilizzato con player.replace()
// per evitare di accumulare istanze AVPlayer native su iOS (limite ~64).
export function VideoCard({ player }: Props) {
  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
});
