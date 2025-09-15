import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

type RootStackParamList = {
  Dashboard: undefined;
  TripDetails: undefined;
  StudentList: undefined;
  Emergency: undefined;
  Profile: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTrip, students, isTracking } = useTrip();
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login' as any);
        },
      },
    ]);
  };

  const quickActions = [
    {
      title: 'Start Trip',
      subtitle: 'Begin your route',
      onPress: () => navigation.navigate('TripDetails'),
      disabled: isTracking,
    },
    {
      title: 'Student List',
      subtitle: 'View passengers',
      onPress: () => navigation.navigate('StudentList'),
      disabled: !currentTrip,
    },
    {
      title: 'Emergency',
      subtitle: 'Report incident',
      onPress: () => navigation.navigate('Emergency'),
      style: 'emergency',
    },
    {
      title: 'Profile',
      subtitle: 'Account settings',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
            <Text style={styles.subtitle}>Ready for today's routes</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Current Trip Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Current Status</Text>
          {currentTrip ? (
            <View style={styles.tripInfo}>
              <Text style={styles.tripStatus}>
                {isTracking ? 'On Route' : 'Trip Paused'}
              </Text>
              <Text style={styles.tripDetails}>Route: {currentTrip.id}</Text>
              <Text style={styles.tripDetails}>
                Students: {students.length}
              </Text>
            </View>
          ) : (
            <Text style={styles.noTripText}>No active trip</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionCard,
                  action.disabled && styles.actionCardDisabled,
                  action.style === 'emergency' && styles.emergencyCard,
                ]}
                onPress={action.onPress}
                disabled={action.disabled}
              >
                <Text
                  style={[
                    styles.actionTitle,
                    action.style === 'emergency' && styles.emergencyText,
                  ]}
                >
                  {action.title}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    action.style === 'emergency' && styles.emergencyText,
                  ]}
                >
                  {action.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Trips Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Students Transported</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0 km</Text>
              <Text style={styles.statLabel}>Distance Driven</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0 min</Text>
              <Text style={styles.statLabel}>On Time Performance</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#bfdbfe',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tripInfo: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  tripStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
  },
  tripDetails: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 2,
  },
  noTripText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actionsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  emergencyCard: {
    backgroundColor: '#dc2626',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emergencyText: {
    color: '#fff',
  },
  statsSection: {
    margin: 16,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default DashboardScreen;
