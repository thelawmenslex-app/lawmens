import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './App/Slices/store';
import Routes from './App/Navigations/Stacknavigator';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#181A20" />
        <Routes />
      </SafeAreaProvider>
    </Provider>
  );
}
