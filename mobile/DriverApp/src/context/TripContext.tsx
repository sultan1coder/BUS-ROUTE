import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, Student, LocationData } from '../../../shared/types';

interface TripContextType {
  currentTrip: Trip | null;
  students: Student[];
  isTracking: boolean;
  currentLocation: LocationData | null;
  startTrip: (trip: Trip) => Promise<void>;
  endTrip: () => Promise<void>;
  updateLocation: (location: LocationData) => void;
  markStudentPickup: (studentId: string) => Promise<void>;
  markStudentDropoff: (studentId: string) => Promise<void>;
  triggerEmergency: (type: string, description: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );

  const startTrip = async (trip: Trip) => {
    try {
      // This would be replaced with actual API call
      // const response = await api.post('/driver/trips/start', tripData);

      setCurrentTrip(trip);
      setIsTracking(true);

      // Mock student data
      const mockStudents: Student[] = [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          dateOfBirth: new Date('2015-01-01'),
          grade: '3rd Grade',
          schoolId: 'school1',
          parentId: 'parent1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          firstName: 'Bob',
          lastName: 'Smith',
          dateOfBirth: new Date('2014-05-15'),
          grade: '4th Grade',
          schoolId: 'school1',
          parentId: 'parent2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setStudents(mockStudents);
    } catch (error) {
      throw error;
    }
  };

  const endTrip = async () => {
    try {
      if (!currentTrip) return;

      // This would be replaced with actual API call
      // await api.put(`/driver/trips/${currentTrip.id}`, { status: 'COMPLETED' });

      setCurrentTrip(null);
      setStudents([]);
      setIsTracking(false);
      setCurrentLocation(null);
    } catch (error) {
      throw error;
    }
  };

  const updateLocation = (location: LocationData) => {
    setCurrentLocation(location);

    // This would send location updates to the server
    // api.post('/driver/location', location);
  };

  const markStudentPickup = async (studentId: string) => {
    try {
      // This would be replaced with actual API call
      // await api.post('/driver/trips/pickup', { studentId, tripId: currentTrip?.id });

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, status: 'PICKED_UP' }
            : student,
        ),
      );
    } catch (error) {
      throw error;
    }
  };

  const markStudentDropoff = async (studentId: string) => {
    try {
      // This would be replaced with actual API call
      // await api.post('/driver/trips/drop', { studentId, tripId: currentTrip?.id });

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, status: 'DROPPED_OFF' }
            : student,
        ),
      );
    } catch (error) {
      throw error;
    }
  };

  const triggerEmergency = async (type: string, description: string) => {
    try {
      // This would be replaced with actual API call
      // await api.post('/driver/emergency', { type, description, location: currentLocation });

      console.log('Emergency triggered:', { type, description });
    } catch (error) {
      throw error;
    }
  };

  const value: TripContextType = {
    currentTrip,
    students,
    isTracking,
    currentLocation,
    startTrip,
    endTrip,
    updateLocation,
    markStudentPickup,
    markStudentDropoff,
    triggerEmergency,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
