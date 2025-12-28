import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../UI/textWrapper';

interface ChatBubbleProps {
  content: string;
  isOwnMessage: boolean;
  timestamp: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, isOwnMessage, timestamp }) => {
  const { colors } = useTheme();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwnMessage ? colors.secondary : colors.primaryDark,
          },
        ]}
      >
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
          {formatTime(timestamp)}
        </AppText>
      </View>
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
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default ChatBubble;
