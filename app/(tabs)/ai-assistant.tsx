import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import aiService, { TeamRecommendation } from '../../services/aiService';
import { useTheme } from '../../contexts/ThemeContext';

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const examplePrompts = [
    "Build my team for a fintech hack (need React + backend + pitch)",
    "Find teammates for an AI/ML project",
    "I need a full-stack team for a healthcare app",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiService.buildTeam(prompt);
      setResponse(result.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Send Invitations',
      'Send team invitations to recommended members?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            Alert.alert('Success', 'Invitations sent to team members!');
            setResponse(null);
            setPrompt('');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Ionicons name="sparkles" size={32} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Team Builder</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!response && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What do you need?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Describe your project and the team you're looking for
            </Text>

            <View style={styles.examplesContainer}>
              <Text style={[styles.examplesTitle, { color: colors.textSecondary }]}>Try these:</Text>
              {examplePrompts.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.exampleChip, { backgroundColor: colors.badge }]}
                  onPress={() => setPrompt(example)}
                >
                  <Text style={[styles.exampleText, { color: colors.primary }]}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {response && (
          <View style={styles.responseContainer}>
            <View style={[styles.analysisCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Analysis</Text>
              <Text style={[styles.analysisText, { color: colors.textSecondary }]}>{response.analysis}</Text>
            </View>

            {response.recommendedTeam && response.recommendedTeam.length > 0 && (
              <View style={[styles.teamCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>👥 Recommended Team</Text>
                {response.recommendedTeam.map((member: TeamRecommendation, index: number) => (
                  <View key={index} style={[styles.memberCard, { borderTopColor: colors.border }]}>
                    <View style={styles.memberHeader}>
                      <Ionicons name="person-circle" size={40} color={colors.primary} />
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                        <Text style={[styles.memberRole, { color: colors.primary }]}>{member.role}</Text>
                      </View>
                    </View>
                    <Text style={[styles.matchReason, { color: colors.textSecondary }]}>{member.matchReason}</Text>
                    <View style={styles.memberSkills}>
                      {member.skills?.map((skill, idx) => (
                        <View key={idx} style={[styles.skillBadge, { backgroundColor: colors.badge }]}>
                          <Text style={[styles.skillText, { color: colors.badgeText }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {response.roleSplit && Object.keys(response.roleSplit).length > 0 && (
              <View style={[styles.roleSplitCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>🎯 Suggested Role Split</Text>
                {Object.entries(response.roleSplit).map(([role, description], index) => (
                  <View key={index} style={[styles.roleItem, { borderTopColor: colors.border }]}>
                    <Text style={[styles.roleName, { color: colors.primary }]}>{role}</Text>
                    <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>{description as string}</Text>
                  </View>
                ))}
              </View>
            )}

            {response.draftMessage && (
              <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>✉️ Draft Message</Text>
                <Text style={[styles.draftMessage, { color: colors.text }]}>{response.draftMessage}</Text>
              </View>
            )}

            {response.nextSteps && response.nextSteps.length > 0 && (
              <View style={[styles.nextStepsCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>🚀 Next Steps</Text>
                {response.nextSteps.map((step: string, index: number) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.approveButton, { backgroundColor: colors.primary }]}
                onPress={handleApprove}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.approveButtonText}>Approve & Send</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.inputBackground }]}
                onPress={() => setResponse(null)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!response && (
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
            placeholder="Describe your team needs..."
            placeholderTextColor={colors.textSecondary}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }, isLoading && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  examplesContainer: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  exampleChip: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
  },
  responseContainer: {
    gap: 15,
  },
  analysisCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  memberCard: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 14,
    color: '#007AFF',
  },
  matchReason: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  memberSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#333',
  },
  draftMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  roleSplitCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 12,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  nextStepsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 10,
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
