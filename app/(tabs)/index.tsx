import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import projectService from '../../services/projectService';
import skillService from '../../services/skillService';
import authService from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [timelineHours, setTimelineHours] = useState('');
  const [timelineMinutes, setTimelineMinutes] = useState('');
  const [step, setStep] = useState(1);
  
  // Filter states
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterTeamSize, setFilterTeamSize] = useState<string>('');
  const [filterTimeline, setFilterTimeline] = useState<string>('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    loadProjects();
    loadSkills();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await authService.getCurrentUser();
    if (user) setCurrentUserId(user._id);
  };

  const loadSkills = async () => {
    try {
      const response = await skillService.getAllSkills();
      if (response && response.skills) {
        setAllSkills(response.skills);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getAllProjects({ search: searchQuery });
      setProjects(response.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProjects();
  };

  const handleSearch = () => {
    setIsLoading(true);
    loadProjects();
  };

  const handleCreateProject = () => {
    console.log('CREATE PROJECT BUTTON CLICKED');
    setProjectTitle('');
    setProjectDescription('');
    setSelectedSkills([]);
    setTimelineHours('');
    setTimelineMinutes('');
    setStep(1);
    setShowCreateModal(true);
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectService.deleteProject(projectId);
              Alert.alert('Success', 'Project deleted successfully');
              loadProjects();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const handleCreateSubmit = async () => {
    if (step === 1) {
      if (!projectTitle.trim()) {
        Alert.alert('Error', 'Please enter a project title');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!projectDescription.trim()) {
        Alert.alert('Error', 'Please enter a description');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedSkills.length === 0) {
        Alert.alert('Error', 'Please select at least one required skill');
        return;
      }
      setStep(4);
    } else {
      // Step 4: Timeline
      const hours = parseInt(timelineHours) || 0;
      const minutes = parseInt(timelineMinutes) || 0;
      
      if (hours === 0 && minutes === 0) {
        Alert.alert('Error', 'Please enter a timeline (hours and/or minutes)');
        return;
      }

      try {
        // Get tech stack from selected skills
        const techStackArray = selectedSkills.map(skillId => {
          const skill = allSkills.find(s => s._id === skillId);
          return skill ? skill.name : '';
        }).filter(name => name);
        
        // Format timeline
        let timelineText = '';
        if (hours > 0) timelineText += `${hours} hour${hours > 1 ? 's' : ''}`;
        if (hours > 0 && minutes > 0) timelineText += ' ';
        if (minutes > 0) timelineText += `${minutes} min${minutes > 1 ? 's' : ''}`;
        
        await projectService.createProject({
          title: projectTitle.trim(),
          description: projectDescription.trim(),
          techStack: techStackArray,
          teamSize: 4,
          requiredSkills: selectedSkills,
          timeline: timelineText
        });
        Alert.alert('Success', 'Project created successfully!');
        setShowCreateModal(false);
        loadProjects();
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
      }
    }
  };

  const renderProject = ({ item }: any) => {
    const isMyProject = item.createdBy?._id === currentUserId;
    
    return (
      <View style={[styles.projectCard, { backgroundColor: colors.card }]}>
        <View style={styles.projectHeader}>
          <Text style={[styles.projectTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={styles.projectHeaderRight}>
            <View style={[styles.teamSizeBadge, { backgroundColor: colors.badge }]}>
              <Ionicons name="people" size={14} color={colors.badgeText} />
              <Text style={[styles.teamSizeText, { color: colors.badgeText }]}>{item.teamSize}</Text>
            </View>
            {isMyProject && (
              <TouchableOpacity
                onPress={() => handleDeleteProject(item._id, item.title)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.skillsContainer}>
          {item.requiredSkills?.slice(0, 4).map((skill: any, index: number) => (
            <View key={index} style={[styles.skillBadge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.skillText, { color: colors.badgeText }]}>{skill.name}</Text>
            </View>
          ))}
          {item.requiredSkills?.length > 4 && (
            <Text style={[styles.moreSkills, { color: colors.textSecondary }]}>+{item.requiredSkills.length - 4}</Text>
          )}
        </View>
        {item.timeline && (
          <View style={styles.timelineContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.timelineText, { color: colors.textSecondary }]}>{item.timeline}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateProject}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search projects..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Be the first to create one!</Text>
          </View>
        }
      />

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {step === 1 ? 'Create Project' : step === 2 ? 'Project Description' : step === 3 ? 'Required Skills' : 'Timeline'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {step === 1 ? 'Step 1 of 4' : step === 2 ? 'Step 2 of 4' : step === 3 ? 'Step 3 of 4' : 'Step 4 of 4'}
            </Text>
            
            {step === 1 ? (
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Enter project title"
                placeholderTextColor={colors.textSecondary}
                value={projectTitle}
                onChangeText={setProjectTitle}
                autoFocus
              />
            ) : step === 2 ? (
              <TextInput
                style={[styles.modalInput, styles.modalTextArea, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder="Enter project description"
                placeholderTextColor={colors.textSecondary}
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
                numberOfLines={4}
                autoFocus
              />
            ) : step === 3 ? (
              <ScrollView style={styles.step3Container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  Select the skills required for this project
                </Text>

                <TouchableOpacity 
                  style={[styles.skillPickerButton, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                  onPress={() => setShowSkillPicker(!showSkillPicker)}
                >
                  <Text style={[styles.skillPickerButtonText, { color: colors.text }]}>
                    {selectedSkills.length === 0 
                      ? 'Tap to select skills' 
                      : `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`}
                  </Text>
                  <Ionicons 
                    name={showSkillPicker ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>

                {showSkillPicker && (
                  <ScrollView style={[styles.skillPickerContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    {allSkills.map((skill) => (
                      <TouchableOpacity
                        key={skill._id}
                        style={[
                          styles.skillPickerItem,
                          { borderBottomColor: colors.border },
                          selectedSkills.includes(skill._id) && [styles.skillPickerItemSelected, { backgroundColor: colors.badge }]
                        ]}
                        onPress={() => toggleSkill(skill._id)}
                      >
                        <Text style={[
                          styles.skillPickerItemText,
                          { color: colors.text },
                          selectedSkills.includes(skill._id) && [styles.skillPickerItemTextSelected, { color: colors.primary }]
                        ]}>
                          {skill.name}
                        </Text>
                        {selectedSkills.includes(skill._id) && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {selectedSkills.length > 0 && (
                  <View style={styles.selectedSkillsContainer}>
                    <Text style={[styles.selectedSkillsLabel, { color: colors.textSecondary }]}>Selected Skills:</Text>
                    <View style={styles.selectedSkillsWrapper}>
                      {selectedSkills.map((skillId) => {
                        const skill = allSkills.find(s => s._id === skillId);
                        return skill ? (
                          <View key={skillId} style={[styles.selectedSkillChip, { backgroundColor: colors.badge }]}>
                            <Text style={[styles.selectedSkillText, { color: colors.primary }]}>{skill.name}</Text>
                            <TouchableOpacity onPress={() => toggleSkill(skillId)}>
                              <Ionicons name="close-circle" size={16} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.timelineInputContainer}>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  How long will this project take?
                </Text>
                <View style={styles.timelineInputRow}>
                  <View style={styles.timelineInputGroup}>
                    <TextInput
                      style={[styles.timelineInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={timelineHours}
                      onChangeText={setTimelineHours}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>Hours</Text>
                  </View>
                  <Text style={[styles.timelineSeparator, { color: colors.textSecondary }]}>:</Text>
                  <View style={styles.timelineInputGroup}>
                    <TextInput
                      style={[styles.timelineInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={timelineMinutes}
                      onChangeText={setTimelineMinutes}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>Minutes</Text>
                  </View>
                </View>
                <Text style={[styles.timelineExample, { color: colors.textSecondary }]}>
                  Example: 24 hours or 2 hours 30 minutes
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.inputBackground }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
                onPress={handleCreateSubmit}
              >
                <Text style={styles.modalButtonText}>
                  {step === 4 ? 'Create' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  teamSizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamSizeText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
  moreSkills: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timelineText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
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
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  step3Container: {
    maxHeight: 400,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  skillPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  skillPickerButtonText: {
    fontSize: 14,
    color: '#333',
  },
  skillPickerContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  skillPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skillPickerItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  skillPickerItemText: {
    fontSize: 14,
    color: '#333',
  },
  skillPickerItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedSkillsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  selectedSkillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectedSkillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  selectedSkillText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  timelineInputContainer: {
    alignItems: 'center',
  },
  timelineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timelineInputGroup: {
    alignItems: 'center',
  },
  timelineInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: 80,
    backgroundColor: '#f8f9fa',
  },
  timelineLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  timelineSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
  },
  timelineExample: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
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
});
