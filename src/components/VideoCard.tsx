import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

// VideoCard usa expo-av con forwardRef.
// Il ref viene creato UNA VOLTA in SwipeScreen e passato qui.
// Un solo Video component è montato alla volta → nessun accumulo AVPlayer.
export const VideoCard = forwardRef<Video>(function VideoCard(_, ref) {
  return (
    <View style={styles.container}>
      <Video
        ref={ref}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
});
