import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import teamService from '../../services/teamService';
import authService from '../../services/authService';

export default function TeamsScreen() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadTeams();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await authService.getCurrentUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getAllTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTeams();
  };

  const handleCreateTeam = () => {
    Alert.prompt(
      'Create Team',
      'Enter team name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (teamName) => {
            if (!teamName || !teamName.trim()) {
              Alert.alert('Error', 'Please enter a team name');
              return;
            }
            try {
              await teamService.createTeam(teamName.trim());
              Alert.alert('Success', 'Team created successfully!');
              loadTeams();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleScanQR = () => {
    Alert.alert(
      'Join Team',
      'Enter team ID to join (QR scanning not available in Expo Go)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async (teamId) => {
            if (!teamId || !teamId.trim()) {
              Alert.alert('Error', 'Please enter a team ID');
              return;
            }
            try {
              await teamService.joinByQR(teamId.trim());
              Alert.alert('Success', 'Joined team successfully!');
              loadTeams();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to join team');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const renderTeam = ({ item }: any) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <View style={styles.memberCount}>
          <Ionicons name="people" size={16} color="#007AFF" />
          <Text style={styles.memberCountText}>{item.members?.length || 0}</Text>
        </View>
      </View>
      {item.project && (
        <Text style={styles.projectName}>Project: {item.project.title}</Text>
      )}
      <View style={styles.membersContainer}>
        {item.members?.slice(0, 3).map((member: any, index: number) => (
          <View key={index} style={styles.memberBadge}>
            <Ionicons name="person" size={12} color="#666" />
            <Text style={styles.memberName}>{member.name}</Text>
          </View>
        ))}
        {item.members?.length > 3 && (
          <Text style={styles.moreMembers}>+{item.members.length - 3} more</Text>
        )}
      </View>
    </View>
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
        <Text style={styles.headerTitle}>My Teams</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTeam}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.qrCardContainer}>
        <TouchableOpacity style={styles.qrCard} onPress={handleScanQR}>
          <Ionicons name="qr-code" size={48} color="#007AFF" />
          <Text style={styles.qrTitle}>Join Team</Text>
          <Text style={styles.qrSubtitle}>Enter team ID to join</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeam}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No teams yet</Text>
            <Text style={styles.emptySubtext}>Create or join a team to get started</Text>
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
  qrCardContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  teamCard: {
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
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  projectName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  moreMembers: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
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
