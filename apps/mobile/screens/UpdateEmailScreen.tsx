import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/auth.service';

export default function UpdateEmailScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      const userData = await storage.getUserData();
      setEmail(userData?.email || '');
    };
    load();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = await storage.getToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }

      const response = await authService.updateEmail(email, token);

      // update local storage
      const userData = await storage.getUserData();
      await storage.saveUserData({
        ...userData,
        email: response.email, // backend returns email
      });

      Alert.alert('Success', 'Your email has been updated.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to update email.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Email</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Enter new email"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Email</Text>
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
