import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SwipeScreen } from '../screens/SwipeScreen';
import { FilterScreen } from '../screens/FilterScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  Swipe: undefined;
  Filter: undefined;
  Summary: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.keep,
          background: COLORS.bg,
          card: COLORS.bgCard,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.bg },
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
