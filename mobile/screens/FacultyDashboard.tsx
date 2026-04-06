import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FacultyDashboard'>;
};

export default function FacultyDashboard({ navigation }: Props) {
  const { logout } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>
      <Pressable style={styles.button} onPress={() => { logout(); navigation.navigate('Login'); }}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 20 },
  button: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 8, backgroundColor: '#1a1a1a' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
