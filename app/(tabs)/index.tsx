import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import projectService from '../../services/projectService';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

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
    Alert.prompt(
      'Create Project',
      'Enter project title',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (title) => {
            if (!title || !title.trim()) {
              Alert.alert('Error', 'Please enter a project title');
              return;
            }
            Alert.prompt(
              'Project Description',
              'Enter project description',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Create',
                  onPress: async (description) => {
                    if (!description || !description.trim()) {
                      Alert.alert('Error', 'Please enter a description');
                      return;
                    }
                    try {
                      await projectService.createProject({
                        title: title.trim(),
                        description: description.trim(),
                        teamSize: 4,
                        requiredSkills: []
                      });
                      Alert.alert('Success', 'Project created successfully!');
                      loadProjects();
                    } catch (error: any) {
                      Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ],
      'plain-text'
    );
  };

  const renderProject = ({ item }: any) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <View style={styles.teamSizeBadge}>
          <Ionicons name="people" size={14} color="#007AFF" />
          <Text style={styles.teamSizeText}>{item.teamSize}</Text>
        </View>
      </View>
      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.skillsContainer}>
        {item.requiredSkills?.slice(0, 3).map((skill: any, index: number) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill.name}</Text>
          </View>
        ))}
        {item.requiredSkills?.length > 3 && (
          <Text style={styles.moreSkills}>+{item.requiredSkills.length - 3}</Text>
        )}
      </View>
      {item.timeline && (
        <View style={styles.timelineContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.timelineText}>{item.timeline}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateProject}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
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
});
