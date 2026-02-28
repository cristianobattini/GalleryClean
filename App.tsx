import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GalleryProvider } from './src/context/GalleryContext';
import { MainNavigator } from './src/navigation/MainNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GalleryProvider>
          <StatusBar style="light" />
          <MainNavigator />
        </GalleryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
