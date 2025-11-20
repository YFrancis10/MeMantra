import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
      // TODO: call backend endpoint to update password
      Alert.alert('Success', 'Password updated successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update password.');
    }
  };

  return (
    <View style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: '#A8B3A2',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Red_Hat_Text-Bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 17,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#6D7E68',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Red_Hat_Text-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
});
