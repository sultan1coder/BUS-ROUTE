/**
 * School Bus Tracker - Driver App
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import StudentListScreen from './src/screens/StudentListScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import context
import { AuthProvider } from './src/context/AuthContext';
import { TripProvider } from './src/context/TripContext';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <AuthProvider>
        <TripProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1e40af',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Driver Dashboard' }}
              />
              <Stack.Screen
                name="TripDetails"
                component={TripDetailsScreen}
                options={{ title: 'Trip Details' }}
              />
              <Stack.Screen
                name="StudentList"
                component={StudentListScreen}
                options={{ title: 'Students' }}
              />
              <Stack.Screen
                name="Emergency"
                component={EmergencyScreen}
                options={{ title: 'Emergency' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </TripProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
