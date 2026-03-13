import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import teamService from '../../services/teamService';
import authService from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';

export default function TeamsScreen() {
  const { colors } = useTheme();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTeamQR, setSelectedTeamQR] = useState<any>(null);
  const [joinMethod, setJoinMethod] = useState<'id' | 'qr'>('id'); // 'id' or 'qr'
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadTeams();
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    const user = await authService.getCurrentUser();
    if (user) setCurrentUserId(user._id);
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getAllTeams();
      // Filter teams to show only those created by current user
      const myTeams = (response.teams || []).filter((team: any) => 
        team.createdBy?._id === currentUserId || team.createdBy === currentUserId
      );
      setTeams(myTeams);
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
    console.log('CREATE TEAM BUTTON CLICKED');
    setTeamName('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    try {
      await teamService.createTeam(teamName.trim());
      Alert.alert('Success', 'Team created successfully!');
      setShowCreateModal(false);
      loadTeams();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleScanQR = () => {
    setTeamId('');
    setJoinMethod('id'); // Default to ID method
    setScanned(false);
    setShowJoinModal(true);
  };

  const handleShowQR = (team: any) => {
    setSelectedTeamQR(team);
    setShowQRModal(true);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scanned && !isProcessing) {
      setScanned(true);
      setIsProcessing(true);
      
      // Validate if it's a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[a-f\d]{24}$/i.test(data);
      
      if (!isValidObjectId) {
        setIsProcessing(false);
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid team code. Please scan a team QR code.',
          [
            {
              text: 'Try Again',
              onPress: () => setScanned(false)
            },
            {
              text: 'Enter ID Manually',
              onPress: () => setJoinMethod('id')
            }
          ]
        );
        return;
      }

      // Try to join the team immediately
      try {
        await teamService.joinByQR(data);
        setIsProcessing(false);
        Alert.alert(
          'Success!',
          'You have successfully joined the team!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowJoinModal(false);
                setScanned(false);
                loadTeams();
              }
            }
          ]
        );
      } catch (error: any) {
        setIsProcessing(false);
        const errorMessage = error.response?.data?.message || 'Failed to join team';
        Alert.alert(
          'Cannot Join Team',
          errorMessage,
          [
            {
              text: 'Try Another Code',
              onPress: () => setScanned(false)
            },
            {
              text: 'Cancel',
              onPress: () => {
                setShowJoinModal(false);
                setScanned(false);
              }
            }
          ]
        );
      }
    }
  };

  const handleRequestCameraPermission = async () => {
    if (!permission) return;
    
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan QR codes.',
          [{ text: 'OK' }]
        );
        setJoinMethod('id'); // Switch back to ID method
      }
    }
  };

  const getQRCodeUrl = (teamId: string) => {
    // Using QR Server API to generate QR codes
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(teamId)}`;
  };

  const handleJoinSubmit = async () => {
    if (!teamId.trim()) {
      Alert.alert('Error', 'Please enter a team ID');
      return;
    }
    try {
      await teamService.joinByQR(teamId.trim());
      Alert.alert('Success', 'Joined team successfully!');
      setShowJoinModal(false);
      loadTeams();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to join team');
    }
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
      
      <View style={styles.teamIdContainer}>
        <View style={styles.teamIdRow}>
          <Text style={styles.teamIdLabel}>Team ID:</Text>
          <Text style={styles.teamId} numberOfLines={1}>{item._id}</Text>
        </View>
        <View style={styles.teamIdActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => handleShowQR(item)}
          >
            <Ionicons name="qr-code-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              Alert.alert('Team ID', `Share this ID with others to join:\n\n${item._id}`);
            }}
          >
            <Ionicons name="copy-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Teams</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTeam}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.qrCardContainer}>
        <TouchableOpacity style={[styles.qrCard, { backgroundColor: colors.card }]} onPress={handleScanQR}>
          <Ionicons name="qr-code" size={48} color={colors.primary} />
          <Text style={[styles.qrTitle, { color: colors.text }]}>Join Team</Text>
          <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>Enter team ID to join</Text>
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

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Team</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter team name"
              placeholderTextColor={colors.textSecondary}
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />
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
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.joinModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.joinModalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join Team</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Method Selection Tabs */}
            <View style={[styles.methodTabs, { backgroundColor: colors.inputBackground }]}>
              <TouchableOpacity
                style={[styles.methodTab, joinMethod === 'id' && [styles.methodTabActive, { backgroundColor: colors.card }]]}
                onPress={() => {
                  setJoinMethod('id');
                  setScanned(false);
                }}
              >
                <Ionicons 
                  name="keypad-outline" 
                  size={20} 
                  color={joinMethod === 'id' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.methodTabText, { color: colors.textSecondary }, joinMethod === 'id' && [styles.methodTabTextActive, { color: colors.primary }]]}>
                  Enter ID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodTab, joinMethod === 'qr' && [styles.methodTabActive, { backgroundColor: colors.card }]]}
                onPress={() => {
                  setJoinMethod('qr');
                  setScanned(false);
                  handleRequestCameraPermission();
                }}
              >
                <Ionicons 
                  name="qr-code-outline" 
                  size={20} 
                  color={joinMethod === 'qr' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.methodTabText, { color: colors.textSecondary }, joinMethod === 'qr' && [styles.methodTabTextActive, { color: colors.primary }]]}>
                  Scan QR
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on selected method */}
            {joinMethod === 'id' ? (
              <View style={styles.joinMethodContent}>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Enter the team ID to join</Text>
                <TextInput
                  style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
                  placeholder="Paste team ID here"
                  placeholderTextColor={colors.textSecondary}
                  value={teamId}
                  onChangeText={setTeamId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.inputBackground }]}
                    onPress={() => setShowJoinModal(false)}
                  >
                    <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSubmit, { backgroundColor: colors.primary }]}
                    onPress={handleJoinSubmit}
                  >
                    <Text style={styles.modalButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.joinMethodContent}>
                {!permission ? (
                  <View style={styles.qrScanPlaceholder}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.qrScanTitle}>Loading Camera...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View style={styles.qrScanPlaceholder}>
                    <Ionicons name="camera-outline" size={80} color="#999" />
                    <Text style={styles.qrScanTitle}>Camera Permission Required</Text>
                    <Text style={styles.qrScanInstructions}>
                      To scan QR codes, we need access to your camera.
                    </Text>
                    <TouchableOpacity
                      style={styles.permissionButton}
                      onPress={requestPermission}
                    >
                      <Ionicons name="camera-outline" size={20} color="#fff" />
                      <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.switchMethodButton}
                      onPress={() => setJoinMethod('id')}
                    >
                      <Ionicons name="keypad-outline" size={20} color="#007AFF" />
                      <Text style={styles.switchMethodText}>Use Enter ID Instead</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.cameraContainer}>
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                      barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                      }}
                    >
                      <View style={styles.cameraOverlay}>
                        <View style={styles.scanFrame}>
                          <View style={[styles.corner, styles.cornerTopLeft]} />
                          <View style={[styles.corner, styles.cornerTopRight]} />
                          <View style={[styles.corner, styles.cornerBottomLeft]} />
                          <View style={[styles.corner, styles.cornerBottomRight]} />
                        </View>
                        {!scanned && !isProcessing && (
                          <Text style={styles.scanInstructions}>
                            Point camera at QR code
                          </Text>
                        )}
                        {isProcessing && (
                          <View style={styles.processingBadge}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.processingText}>Validating & Joining...</Text>
                          </View>
                        )}
                        {scanned && !isProcessing && (
                          <View style={styles.scannedBadge}>
                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            <Text style={styles.scannedText}>Processing...</Text>
                          </View>
                        )}
                      </View>
                    </CameraView>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 16 }]}
                      onPress={() => {
                        setJoinMethod('id');
                        setScanned(false);
                        setIsProcessing(false);
                      }}
                      disabled={isProcessing}
                    >
                      <Text style={styles.modalButtonTextCancel}>
                        {isProcessing ? 'Processing...' : 'Cancel Scan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.qrModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, { color: colors.text }]}>{selectedTeamQR?.name}</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.qrCodeContainer, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: getQRCodeUrl(selectedTeamQR?._id || '') }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.qrInstructions, { color: colors.textSecondary }]}>
              Share this QR code with others to join the team
            </Text>

            <View style={[styles.qrIdContainer, { backgroundColor: colors.badge }]}>
              <Text style={[styles.qrIdLabel, { color: colors.primary }]}>Team ID:</Text>
              <Text style={[styles.qrIdText, { color: colors.textSecondary }]} selectable>{selectedTeamQR?._id}</Text>
            </View>

            <TouchableOpacity
              style={[styles.qrCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </TouchableOpacity>
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
  teamIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  teamIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  teamIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 6,
  },
  teamId: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    fontFamily: 'monospace',
  },
  teamIdActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
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
  joinModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 420,
  },
  joinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  methodTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  methodTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  joinMethodContent: {
    width: '100%',
  },
  qrScanPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrScanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  qrScanInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrScanSteps: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  qrScanStep: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  switchMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  switchMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  cameraContainer: {
    width: '100%',
  },
  camera: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  scannedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
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
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrIdContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  qrIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  qrIdText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  qrCloseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  qrCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
