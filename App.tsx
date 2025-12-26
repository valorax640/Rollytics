import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, Appearance} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  useEffect(() => {
    // Force light mode
    Appearance.setColorScheme('light');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        backgroundColor="#2563EB" 
        barStyle="light-content" 
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;