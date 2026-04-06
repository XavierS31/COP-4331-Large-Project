import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login, token, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      if (userType === 'faculty') {
        navigation.navigate('FacultyDashboard');
      } else {
        navigation.navigate('StudentDashboard');
      }
    }
  }, [token, userType, navigation]);

  const handleSubmit = async () => {
    if (!loginId || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password })
      });
      
      const data = await response.json();
      
      if (data.error) {
        Alert.alert('Error', data.error);
      } else if (data.token) {
        login({ user: data.user, userType: data.userType, token: data.token });
        if (data.userType === 'student') {
          navigation.navigate('StudentDashboard');
        } else {
          navigation.navigate('FacultyDashboard');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Research Finder</Text>
        <Text style={styles.subtitle}>Welcome back. Sign in to continue.</Text>
        
        <View style={styles.spacer} />

        <Text style={styles.label}>USERNAME</Text>
        <TextInput
          style={styles.input}
          value={loginId}
          onChangeText={setLoginId}
          autoCapitalize="none"
          placeholder="Enter your username"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
          placeholderTextColor="#555"
        />

        <View style={styles.spacer} />

        <Pressable 
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 32,
  },
  label: {
    color: '#888888',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ffc909',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 14,
  },
  spacer: {
    height: 16,
  }
});
