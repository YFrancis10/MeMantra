import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdatePasswordScreen from '../../screens/UpdatePasswordScreen';
import { storage } from '../../utils/storage';
import { authService } from '../../services/auth.service';
import { logoutUser } from '../../utils/auth';

jest.mock('../../utils/storage', () => ({
  storage: {
    getToken: jest.fn(),
  },
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    updatePassword: jest.fn(),
  },
}));

jest.mock('../../utils/auth', () => ({
  logoutUser: jest.fn(),
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.spyOn(Alert, 'alert');

describe('UpdatePasswordScreen', () => {
  const setup = () => render(<UpdatePasswordScreen />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error for short password', () => {
    const { getByText, getByPlaceholderText } = setup();

    fireEvent.changeText(getByPlaceholderText('New password'), 'abc');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'abc');

    fireEvent.press(getByText('Save Password'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters.');
  });

  it('shows error for mismatched passwords', () => {
    const { getByText, getByPlaceholderText } = setup();

    fireEvent.changeText(getByPlaceholderText('New password'), 'abcdef');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), '123456');

    fireEvent.press(getByText('Save Password'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match.');
  });

  it('updates password successfully and logs out', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('token-abc');
    (authService.updatePassword as jest.Mock).mockResolvedValue({ status: 'success' });

    const { getByText, getByPlaceholderText } = setup();

    fireEvent.changeText(getByPlaceholderText('New password'), 'abcdef');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'abcdef');

    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith('abcdef', 'token-abc');
      expect(logoutUser).toHaveBeenCalled();
    });
  });

  it('handles backend error gracefully', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('t');
    (authService.updatePassword as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const { getByText, getByPlaceholderText } = setup();

    fireEvent.changeText(getByPlaceholderText('New password'), 'abcdef');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'abcdef');

    fireEvent.press(getByText('Save Password'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update password.'),
    );
  });

  it('goes back on back button press', () => {
    const { getByText } = setup();

    fireEvent.press(getByText('Back'));

    expect(mockGoBack).toHaveBeenCalled();
  });
});
