import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderTopColor: `${colors.primaryDark}33`,
        },
      ]}
    >
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: '#ffffff',
            color: colors.primaryDark,
          },
        ]}
        placeholder="Type a message..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
        editable={!disabled}
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor: message.trim() ? colors.secondary : `${colors.secondary}66`,
          },
        ]}
        onPress={handleSend}
        disabled={disabled || !message.trim()}
      >
        <Ionicons
          name="send"
          size={20}
          color={message.trim() ? colors.primaryDark : `${colors.primaryDark}66`}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'LibreBaskerville-Regular',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default ChatInput;
