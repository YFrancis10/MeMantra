import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../UI/textWrapper';
import { useNavigation } from '@react-navigation/native';
import { Message } from '../../types/chat.types';

interface ChatBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onLongPress?: (message: Message) => void;
  replyToMessage?: Message | null;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwnMessage,
  onLongPress,
  replyToMessage,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const { content, created_at } = message;

  // share a mantra
  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = null;
  }

  //
  if (parsed?.type === 'mantra_share') {
    return (
      <View
        style={[
          styles.container,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainApp', {
              screen: 'Home',
              params: { returnToMantraId: parsed.mantra_id },
            })
          }
          activeOpacity={0.85}
          style={[
            styles.bubble,
            styles.mantraBubble,
            {
              backgroundColor: colors.secondary,
            },
          ]}
        >
          <AppText style={[styles.mantraLabel, { color: colors.primaryDark }]}>
            {isOwnMessage ? 'You shared a mantra' : 'Shared a mantra'}
          </AppText>

          <AppText style={[styles.mantraTitle, { color: colors.primaryDark }]}>
            “{parsed.text ?? 'Open mantra'}”
          </AppText>

          <AppText style={[styles.mantraCTA, { color: colors.primaryDark }]}>Tap to view</AppText>

          <AppText style={[styles.timestamp, { color: `${colors.primaryDark}99` }]}>
            {formatTime(created_at)}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  //text message
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onLongPress && onLongPress(message)}
        style={[
          styles.bubble,
          {
            backgroundColor: isOwnMessage ? colors.secondary : colors.primaryDark,
          },
        ]}
      >
        {/* Show reply context if this is a reply */}
        {replyToMessage && (
          <View
            style={[
              styles.replyContainer,
              {
                backgroundColor: isOwnMessage ? `${colors.primaryDark}20` : '#ffffff20',
                borderLeftColor: isOwnMessage ? colors.primaryDark : '#ffffff',
              },
            ]}
          >
            <AppText
              style={[
                styles.replyText,
                {
                  color: isOwnMessage ? colors.primaryDark : '#ffffff',
                },
              ]}
              numberOfLines={2}
            >
              {replyToMessage.content}
            </AppText>
          </View>
        )}

        <AppText
          style={[
            styles.messageText,
            {
              color: isOwnMessage ? colors.primaryDark : '#ffffff',
            },
          ]}
        >
          {content}
        </AppText>
        <AppText
          style={[
            styles.timestamp,
            {
              color: isOwnMessage ? `${colors.primaryDark}99` : '#ffffff99',
            },
          ]}
        >
          {formatTime(created_at)}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },

  //Mantra bubble for messaginf
  mantraBubble: {
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mantraLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  mantraTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  mantraCTA: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 6,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 4,
  },
  replyText: {
    fontSize: 13,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});

export default ChatBubble;
