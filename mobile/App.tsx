import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import StudentDashboard from './screens/StudentDashboard';
import FacultyDashboard from './screens/FacultyDashboard';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  StudentDashboard: undefined;
  FacultyDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { token, userType } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [isReady, setIsReady] = useState(false);

  // On app load, check auth state: if token is non-null navigate to dashboard based on userType.
  useEffect(() => {
    if (isReady && token) {
      if (userType === 'faculty') {
        navigationRef.navigate('FacultyDashboard');
      } else {
        navigationRef.navigate('StudentDashboard');
      }
    }
  }, [token, userType, isReady]);

  return (
    <NavigationContainer 
      ref={navigationRef} 
      onReady={() => setIsReady(true)}
    >
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
