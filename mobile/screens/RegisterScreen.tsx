import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

type RoleType = 'Student' | 'Faculty';

export default function RegisterScreen({ navigation }: Props) {
  const [userRole, setUserRole] = useState<RoleType>('Student');
  
  // Shared fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // Student fields
  const [major, setMajor] = useState('');
  const [college, setCollege] = useState('');
  
  // Faculty fields
  const [role, setRole] = useState(''); // e.g., 'Professor', 'Researcher'
  const [department, setDepartment] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !username || !password || !email) {
      Alert.alert('Error', 'Please fill in all shared fields.');
      return;
    }

    let url = '';
    let body: any = {};

    if (userRole === 'Student') {
      if (!major || !college) {
        Alert.alert('Error', 'Please fill in Major and College.');
        return;
      }
      url = `${API_BASE_URL}/api/signup/student`;
      body = { firstName, lastName, login: username, password, ucfEmail: email, major, college };
    } else {
      if (!role || !department) {
        Alert.alert('Error', 'Please fill in Role and Department.');
        return;
      }
      url = `${API_BASE_URL}/api/signup/faculty`;
      body = { firstName, lastName, login: username, password, email, role, department };
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert('Success', 'Check your email to verify your account.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Research Finder as a student or faculty member.</Text>
        
        <View style={styles.toggleContainer}>
          <Pressable 
            style={[styles.toggleBtn, userRole === 'Student' && styles.toggleBtnActive]}
            onPress={() => setUserRole('Student')}
          >
            <Text style={[styles.toggleText, userRole === 'Student' && styles.toggleTextActive]}>Student</Text>
          </Pressable>
          <Pressable 
            style={[styles.toggleBtn, userRole === 'Faculty' && styles.toggleBtnActive]}
            onPress={() => setUserRole('Faculty')}
          >
            <Text style={[styles.toggleText, userRole === 'Faculty' && styles.toggleTextActive]}>Faculty</Text>
          </Pressable>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor="#555" />

          <Text style={styles.label}>LAST NAME</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor="#555" />

          <Text style={styles.label}>USERNAME (LOGIN)</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor="#555" />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#555" />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor="#555" />

          {userRole === 'Student' ? (
            <>
              <Text style={styles.label}>MAJOR</Text>
              <TextInput style={styles.input} value={major} onChangeText={setMajor} placeholder="e.g. Computer Science" placeholderTextColor="#555" />

              <Text style={styles.label}>COLLEGE</Text>
              <TextInput style={styles.input} value={college} onChangeText={setCollege} placeholder="e.g. College of Engineering" placeholderTextColor="#555" />
            </>
          ) : (
            <>
              <Text style={styles.label}>ROLE</Text>
              <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="e.g. Professor, Researcher" placeholderTextColor="#555" />

              <Text style={styles.label}>DEPARTMENT</Text>
              <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="e.g. Computer Science" placeholderTextColor="#555" />
            </>
          )}

          <View style={styles.spacer} />

          <Pressable 
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'REGISTERING...' : 'REGISTER'}</Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#333333',
  },
  toggleText: {
    color: '#888888',
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  formSection: {},
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
    height: 8,
  }
});
