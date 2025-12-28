import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from '../components/UI/textWrapper';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import { Message, Conversation } from '../types/chat.types';
import { chatService } from '../services/chat.service';
import { storage } from '../utils/storage';

export default function ConversationScreen({ route, navigation }: any) {
  const { conversation } = route.params as { conversation: Conversation };
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(1); // Will be fetched from storage
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    loadCurrentUser();

    navigation.setOptions({
      title: conversation.participant_username,
    });
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await storage.getUserData();
      if (userData?.user_id) {
        setCurrentUserId(userData.user_id);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const token = await storage.getToken();
      const data = await chatService.getMessages(
        conversation.conversation_id,
        token || 'mock-token',
      );
      setMessages(data);

      // Mark as read
      await chatService.markAsRead(conversation.conversation_id, token || 'mock-token');
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (content: string) => {
    try {
      const token = await storage.getToken();
      const newMessage = await chatService.sendMessage(
        {
          conversation_id: conversation.conversation_id,
          content,
        },
        token || 'mock-token',
      );

      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.centerContainer}>
          <AppText style={{ color: colors.text }}>Loading messages...</AppText>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <AppText style={{ color: colors.text, textAlign: 'center' }}>
            No messages yet.{'\n'}Start the conversation!
          </AppText>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.message_id.toString()}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <ChatBubble
              content={item.content}
              isOwnMessage={item.sender_id === currentUserId}
              timestamp={item.created_at}
            />
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messagesList: {
    paddingVertical: 16,
  },
});
