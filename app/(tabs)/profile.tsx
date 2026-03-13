import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService, { User } from '../../services/authService';
import skillService, { Skill } from '../../services/skillService';
import userService from '../../services/userService';
import { useTheme } from '../../contexts/ThemeContext';
import offlineCache from '../../services/offlineCache';

// Conditionally import notification service to avoid Expo Go errors
let notificationService: any = null;
try {
  notificationService = require('../../services/notificationService').default;
} catch (e) {
  console.log('Notifications not available');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, setTheme, colors, isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [newName, setNewName] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAvailability, setNewAvailability] = useState('available');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cacheInfo, setCacheInfo] = useState<{ keys: string[]; size: number }>({ keys: [], size: 0 });

  useEffect(() => {
    loadProfile();
    loadSkills();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (notificationService) {
      const enabled = await notificationService.getSettings();
      setNotificationsEnabled(enabled);
    }
    const info = await offlineCache.getCacheInfo();
    setCacheInfo(info);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!notificationService) {
      Alert.alert('Not Available', 'Push notifications require a custom development build. They are not available in Expo Go.');
      return;
    }
    setNotificationsEnabled(value);
    await notificationService.setSettings(value);
    if (value) {
      await notificationService.requestPermissions();
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all offline cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineCache.clearAll();
            const info = await offlineCache.getCacheInfo();
            setCacheInfo(info);
            Alert.alert('Success', 'Cache cleared');
          }
        }
      ]
    );
  };

  const loadProfile = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadSkills = async () => {
    try {
      const response = await skillService.getAllSkills();
      if (response && response.skills) {
        setAllSkills(response.skills);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      // Set empty array so it doesn't stay undefined
      setAllSkills([]);
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
    console.log('ADD SKILL BUTTON CLICKED');
    console.log('All skills:', allSkills);
    console.log('User:', user);
    
    if (!user) {
      Alert.alert('Error', 'User data not loaded. Please wait.');
      return;
    }
    
    // Check if skills are loaded
    if (!allSkills) {
      Alert.alert('Loading', 'Skills are loading. Please wait a moment and try again.');
      // Try to load skills again
      loadSkills();
      return;
    }
    
    if (allSkills.length === 0) {
      Alert.alert('No Skills', 'No skills available in the system. Please contact admin.');
      return;
    }
    
    setSelectedSkill('');
    setShowSkillModal(true);
  };

  const handleSkillSubmit = async () => {
    if (!selectedSkill) {
      Alert.alert('Error', 'Please select a skill');
      return;
    }
    try {
      await userService.addSkill(user!._id, selectedSkill);
      Alert.alert('Success', 'Skill added to your profile!');
      setShowSkillModal(false);
      loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    Alert.alert(
      'Remove Skill',
      `Remove ${skillName} from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.removeSkill(user!._id, skillId);
              Alert.alert('Success', 'Skill removed');
              loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove skill');
            }
          }
        }
      ]
    );
  };

  const handleAddPortfolio = () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }
    setPortfolioLink('');
    setShowPortfolioModal(true);
  };

  const handlePortfolioSubmit = async () => {
    if (!portfolioLink.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    try {
      const updatedLinks = [...(user?.portfolioLinks || []), portfolioLink.trim()];
      await userService.updateProfile(user!._id, { portfolioLinks: updatedLinks });
      Alert.alert('Success', 'Portfolio link added');
      setShowPortfolioModal(false);
      loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add link');
    }
  };

  const handleRemovePortfolio = (link: string, index: number) => {
    Alert.alert(
      'Remove Link',
      `Remove this portfolio link?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedLinks = user!.portfolioLinks.filter((_, i) => i !== index);
              await userService.updateProfile(user!._id, { portfolioLinks: updatedLinks });
              Alert.alert('Success', 'Link removed');
              loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove link');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }
    setNewName(user.name);
    setNewCollege(user.college || '');
    setNewEmail(user.email);
    setNewAvailability(user.availability || 'available');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }
    try {
      await userService.updateProfile(user!._id, { 
        name: newName.trim(),
        college: newCollege.trim(),
        email: newEmail.trim(),
        availability: newAvailability
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditModal(false);
      loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  // Calculate available skills
  const userSkillIds = (user?.skills || []).map((s: any) => s._id || s);
  const availableSkills = (allSkills || []).filter(s => !userSkillIds.includes(s._id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Loading...'}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        {user?.college && (
          <View style={styles.collegeContainer}>
            <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.college, { color: colors.textSecondary }]}>{user.college}</Text>
          </View>
        )}
        <View style={[styles.availabilityBadge, { backgroundColor: isDark ? colors.inputBackground : '#F0F0F0' }]}>
          <View style={[styles.statusDot, user?.availability === 'available' && styles.statusDotActive]} />
          <Text style={[styles.availabilityText, { color: colors.text }]}>
            {user?.availability === 'available' ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills</Text>
          <View style={styles.headerButtons}>
            {user?.skills && user.skills.length > 0 && (
              <TouchableOpacity onPress={() => setIsEditingSkills(!isEditingSkills)}>
                <Ionicons 
                  name={isEditingSkills ? "checkmark-circle" : "create-outline"} 
                  size={24} 
                  color={isEditingSkills ? colors.success : colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAddSkill}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.skillsContainer}>
          {user?.skills && user.skills.length > 0 ? (
            user.skills.map((skill: any, index) => (
              <View key={index} style={[styles.skillBadge, { backgroundColor: colors.badge }]}>
                <Text style={[styles.skillText, { color: colors.badgeText }]}>{skill.name}</Text>
                {isEditingSkills && (
                  <TouchableOpacity
                    onPress={() => handleRemoveSkill(skill._id, skill.name)}
                    style={styles.removeIcon}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No skills added yet</Text>
          )}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio Links</Text>
          <View style={styles.headerButtons}>
            {user?.portfolioLinks && user.portfolioLinks.length > 0 && (
              <TouchableOpacity onPress={() => setIsEditingPortfolio(!isEditingPortfolio)}>
                <Ionicons 
                  name={isEditingPortfolio ? "checkmark-circle" : "create-outline"} 
                  size={24} 
                  color={isEditingPortfolio ? colors.success : colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAddPortfolio}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {user?.portfolioLinks && user.portfolioLinks.length > 0 ? (
          user.portfolioLinks.map((link, index) => (
            <View key={index} style={styles.linkItemContainer}>
              <TouchableOpacity style={styles.linkItem}>
                <Ionicons name="link-outline" size={20} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>{link}</Text>
              </TouchableOpacity>
              {isEditingPortfolio && (
                <TouchableOpacity
                  onPress={() => handleRemovePortfolio(link, index)}
                  style={styles.removeLinkButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No portfolio links added</Text>
        )}
      </View>

      <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={handleEditProfile}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <Modal visible={showSkillModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Skill</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {availableSkills.length > 0 
                ? `Select from ${availableSkills.length} available skills` 
                : 'No more skills available'}
            </Text>
            {availableSkills.length > 0 ? (
              <ScrollView style={styles.skillList}>
                {availableSkills.map((skill) => (
                  <TouchableOpacity
                    key={skill._id}
                    style={[
                      styles.skillItem,
                      { borderColor: colors.border, backgroundColor: colors.inputBackground },
                      selectedSkill === skill._id && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setSelectedSkill(skill._id)}
                  >
                    <Text style={[
                      styles.skillItemText,
                      { color: colors.text },
                      selectedSkill === skill._id && { color: '#fff', fontWeight: '600' }
                    ]}>
                      {skill.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>All skills have been added to your profile</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: isDark ? colors.inputBackground : '#f0f0f0' }]}
                onPress={() => setShowSkillModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              {availableSkills.length > 0 && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
                  onPress={handleSkillSubmit}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPortfolioModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Portfolio Link</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="https://github.com/username"
              placeholderTextColor={colors.textSecondary}
              value={portfolioLink}
              onChangeText={setPortfolioLink}
              autoCapitalize="none"
              keyboardType="url"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: isDark ? colors.inputBackground : '#f0f0f0' }]}
                onPress={() => setShowPortfolioModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
                onPress={handlePortfolioSubmit}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <ScrollView style={styles.modalScrollContent} bounces={false}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                  
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    value={newName}
                    onChangeText={setNewName}
                  />

                  <Text style={[styles.inputLabel, { color: colors.text }]}>College</Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Enter your college"
                    placeholderTextColor={colors.textSecondary}
                    value={newCollege}
                    onChangeText={setNewCollege}
                  />

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Availability</Text>
                  <View style={styles.availabilityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.availabilityButton,
                        { borderColor: colors.border, backgroundColor: colors.inputBackground },
                        newAvailability === 'available' && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setNewAvailability('available')}
                    >
                      <Text style={[
                        styles.availabilityButtonText,
                        { color: colors.text },
                        newAvailability === 'available' && { color: '#fff', fontWeight: '600' }
                      ]}>
                        Available
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.availabilityButton,
                        { borderColor: colors.border, backgroundColor: colors.inputBackground },
                        newAvailability === 'not available' && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setNewAvailability('not available')}
                    >
                      <Text style={[
                        styles.availabilityButtonText,
                        { color: colors.text },
                        newAvailability === 'not available' && { color: '#fff', fontWeight: '600' }
                      ]}>
                        Not Available
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: isDark ? colors.inputBackground : '#f0f0f0' }]}
                      onPress={() => setShowEditModal(false)}
                    >
                      <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
                      onPress={handleEditSubmit}
                    >
                      <Text style={styles.modalButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.settingsHeader}>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
              <View style={{ width: 24 }} />
            </View>
            
            {/* Theme Section */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Theme</Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton, 
                    { borderColor: colors.border },
                    theme === 'light' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Ionicons name="sunny" size={20} color={theme === 'light' ? '#fff' : colors.text} />
                  <Text style={[
                    styles.themeButtonText, 
                    { color: theme === 'light' ? '#fff' : colors.text },
                    theme === 'light' && { fontWeight: '600' }
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border },
                    theme === 'dark' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Ionicons name="moon" size={20} color={theme === 'dark' ? '#fff' : colors.text} />
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'dark' ? '#fff' : colors.text },
                    theme === 'dark' && { fontWeight: '600' }
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border },
                    theme === 'auto' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setTheme('auto')}
                >
                  <Ionicons name="phone-portrait" size={20} color={theme === 'auto' ? '#fff' : colors.text} />
                  <Text style={[
                    styles.themeButtonText,
                    { color: theme === 'auto' ? '#fff' : colors.text },
                    theme === 'auto' && { fontWeight: '600' }
                  ]}>
                    Auto
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.settingsSection}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsRowLeft}>
                  <Ionicons name="notifications" size={20} color={colors.text} />
                  <Text style={[styles.settingsRowText, { color: colors.text }]}>Push Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Cache Section */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Offline Cache</Text>
              <View style={[styles.cacheInfo, { backgroundColor: isDark ? colors.inputBackground : '#f0f0f0' }]}>
                <Text style={[styles.cacheInfoText, { color: colors.textSecondary }]}>
                  {cacheInfo.keys.length} items cached
                </Text>
                <Text style={[styles.cacheInfoText, { color: colors.textSecondary }]}>
                  {(cacheInfo.size / 1024).toFixed(2)} KB
                </Text>
              </View>
              <TouchableOpacity style={[styles.clearCacheButton, { borderColor: colors.error }]} onPress={handleClearCache}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.clearCacheText, { color: colors.error }]}>Clear Cache</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  skillText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  removeIcon: {
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  linkItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
  },
  removeLinkButton: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 340,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  availabilityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  availabilityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  availabilityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  availabilityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  skillList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  skillItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  skillItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  skillItemText: {
    fontSize: 16,
    color: '#333',
  },
  skillItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSubmit: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  themeButtonText: {
    fontSize: 14,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsRowText: {
    fontSize: 16,
  },
  cacheInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cacheInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  clearCacheText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
