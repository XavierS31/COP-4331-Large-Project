import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  Pressable, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

interface ResearchPosting {
  _id: string;
  title: string;
  description: string;
  requiredMajor?: string;
  department?: string;
  facultyUsername: string;
  createdAt: string;
  applicantCount?: number;
  capacity?: number;
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StudentDashboard'>;
};

export default function StudentDashboard({ navigation }: Props) {
  const { token, refreshToken, logout } = useAuth();
  
  const [postings, setPostings] = useState<ResearchPosting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [majorFilter, setMajorFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    const fetchPostings = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          major: majorFilter,
          department: departmentFilter,
        }).toString();

        const response = await fetch(`${API_BASE_URL}/api/search?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.token) {
          refreshToken(data.token);
        }

        if (data.postings) {
          setPostings(data.postings);
        } else if (Array.isArray(data)) {
          setPostings(data);
        } else {
          setPostings([]);
        }
      } catch (error) {
        console.error('Error fetching postings:', error);
        setPostings([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPostings();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, majorFilter, departmentFilter, token]);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const renderItem = ({ item }: { item: ResearchPosting }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.facultyUsername}>Posted by: {item.facultyUsername}</Text>
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      <View style={styles.footerRow}>
        {item.department ? (
          <View style={styles.departmentPill}>
            <Text style={styles.departmentText}>{item.department}</Text>
          </View>
        ) : (
          <View />
        )}
        {item.applicantCount !== undefined && (
          <Text style={styles.applicantText}>{item.applicantCount} applicant{item.applicantCount !== 1 ? 's' : ''}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Research Finder</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search research..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TextInput
            style={styles.filterInput}
            placeholder="Major"
            placeholderTextColor="#888888"
            value={majorFilter}
            onChangeText={setMajorFilter}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Department"
            placeholderTextColor="#888888"
            value={departmentFilter}
            onChangeText={setDepartmentFilter}
          />
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ffc909" />
        </View>
      ) : postings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No opportunities found.</Text>
        </View>
      ) : (
        <FlatList
          data={postings}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#ffc909',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
  },
  listContent: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc909',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  facultyUsername: {
    color: '#ffc909',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#aaaaaa',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  departmentPill: {
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  departmentText: {
    color: '#ffffff',
    fontSize: 10,
  },
  applicantText: {
    color: '#888888',
    fontSize: 11,
  },
});
