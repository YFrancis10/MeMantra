import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/auth.service';
import { storage } from '../utils/storage';
import { logoutUser } from '../utils/auth';

export default function UpdatePasswordScreen() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleUpdate = async () => {
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    try {
      const token = await storage.getToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }

      await authService.updatePassword(password, token);

      Alert.alert(
        'Password Updated',
        'Your password has been changed. You will be logged out for security reasons.',
        [
          {
            text: 'OK',
            onPress: () => logoutUser(navigation),
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update password.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Update Password</Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="New password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirm password"
        placeholderTextColor="#aaa"
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8B3A2', padding: 20, paddingTop: 80 },
  backButton: { marginBottom: 10 },
  backText: {
    fontSize: 18,
    fontFamily: 'Red_Hat_Text-SemiBold',
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Red_Hat_Text-Bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 12, fontSize: 17, marginBottom: 25 },
  button: { backgroundColor: '#6D7E68', padding: 16, borderRadius: 12 },
  buttonText: {
    color: 'white',
    fontFamily: 'Red_Hat_Text-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
});
