import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService, { User } from '../../services/authService';
import skillService, { Skill } from '../../services/skillService';
import userService from '../../services/userService';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  const loadProfile = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadSkills = async () => {
    try {
      const response = await skillService.getAllSkills();
      setAllSkills(response.skills);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleAddSkill = () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded. Please wait.');
      return;
    }

    if (!allSkills || allSkills.length === 0) {
      Alert.alert('Loading Skills', 'Skills are still loading. Please try again in a moment.');
      return;
    }

    const userSkillIds = (user.skills || []).map((s: any) => s._id || s);
    const availableSkills = allSkills.filter(s => !userSkillIds.includes(s._id));

    if (availableSkills.length === 0) {
      Alert.alert('All Skills Added', 'You have already added all available skills');
      return;
    }

    // Show first 5 skills as examples
    const exampleSkills = availableSkills.slice(0, 5).map(s => s.name).join(', ');
    const moreText = availableSkills.length > 5 ? ` (and ${availableSkills.length - 5} more)` : '';

    Alert.prompt(
      'Add Skill',
      `Available: ${exampleSkills}${moreText}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (skillName) => {
            if (!skillName || !skillName.trim()) {
              Alert.alert('Error', 'Please enter a skill name');
              return;
            }
            
            const trimmedName = skillName.trim();
            const skill = allSkills.find(s => 
              s.name.toLowerCase() === trimmedName.toLowerCase()
            );
            
            if (!skill) {
              const suggestions = availableSkills.slice(0, 3).map(s => s.name).join(', ');
              Alert.alert('Skill Not Found', `"${trimmedName}" not found. Try: ${suggestions}`);
              return;
            }
            
            try {
              await userService.addSkill(user._id, skill._id);
              Alert.alert('Success', `${skill.name} added to your profile!`);
              loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to add skill');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleAddPortfolio = () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }

    Alert.prompt(
      'Add Portfolio Link',
      'Enter your portfolio, GitHub, or LinkedIn URL',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (link) => {
            if (!link || !link.trim()) {
              Alert.alert('Error', 'Please enter a valid URL');
              return;
            }
            try {
              const updatedLinks = [...(user.portfolioLinks || []), link.trim()];
              await userService.updateProfile(user._id, { portfolioLinks: updatedLinks });
              Alert.alert('Success', 'Portfolio link added');
              loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to add link');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEditProfile = () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }

    Alert.prompt(
      'Edit Name',
      'Enter your new name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            if (!name || !name.trim()) {
              Alert.alert('Error', 'Name cannot be empty');
              return;
            }
            try {
              await userService.updateProfile(user._id, { name: name.trim() });
              Alert.alert('Success', 'Profile updated');
              loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
            }
          }
        }
      ],
      'plain-text',
      user.name
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
        </View>
        <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.college && (
          <View style={styles.collegeContainer}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <Text style={styles.college}>{user.college}</Text>
          </View>
        )}
        <View style={styles.availabilityBadge}>
          <View style={[styles.statusDot, user?.availability === 'available' && styles.statusDotActive]} />
          <Text style={styles.availabilityText}>
            {user?.availability === 'available' ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <TouchableOpacity onPress={handleAddSkill}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.skillsContainer}>
          {user?.skills && user.skills.length > 0 ? (
            user.skills.map((skill: any, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio Links</Text>
          <TouchableOpacity onPress={handleAddPortfolio}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {user?.portfolioLinks && user.portfolioLinks.length > 0 ? (
          user.portfolioLinks.map((link, index) => (
            <TouchableOpacity key={index} style={styles.linkItem}>
              <Ionicons name="link-outline" size={20} color="#007AFF" />
              <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No portfolio links added</Text>
        )}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  collegeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  college: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#34C759',
  },
  availabilityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
