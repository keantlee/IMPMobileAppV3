import 'react-native-gesture-handler'; // 👈 MUST remain on Line 1
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 👈 Add this import
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Route from './src/navigation/AppStack';

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <Route />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});