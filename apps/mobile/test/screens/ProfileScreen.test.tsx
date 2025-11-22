import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../../screens/ProfileScreen';
import { storage } from '../../utils/storage';
import { authService } from '../../services/auth.service';
import { logoutUser } from '../../utils/auth';

jest.mock('../../utils/storage', () => ({
  storage: {
    getUserData: jest.fn(),
    getToken: jest.fn(),
  },
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    deleteAccount: jest.fn(),
  },
}));

jest.mock('../../utils/auth', () => ({
  logoutUser: jest.fn(),
}));

// ✅ mock navigation hook instead of passing navigation prop
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
}));

jest.spyOn(Alert, 'alert');

describe('ProfileScreen', () => {
  const setup = () => render(<ProfileScreen />);

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getUserData as jest.Mock).mockResolvedValue({
      username: 'memantraUser',
      email: 'test@mail.com',
    });
  });

  it('renders username', async () => {
    const { getByText } = setup();

    await waitFor(() => expect(getByText('memantraUser')).toBeTruthy());
  });

  it('navigates to UpdateEmail screen', async () => {
    const { getByText } = setup();

    fireEvent.press(getByText('Update Email'));

    expect(mockNavigate).toHaveBeenCalledWith('UpdateEmail');
  });

  it('navigates to UpdatePassword screen', async () => {
    const { getByText } = setup();

    fireEvent.press(getByText('Update Password'));

    expect(mockNavigate).toHaveBeenCalledWith('UpdatePassword');
  });

  it('deletes account successfully and logs out', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('token-abc');
    (authService.deleteAccount as jest.Mock).mockResolvedValue({ status: 'success' });

    const { getByText } = setup();

    fireEvent.press(getByText('Delete Account'));

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteBtn = alertArgs[2].find((b: any) => b.text === 'Delete');

    await act(async () => deleteBtn.onPress());

    await waitFor(() => {
      expect(authService.deleteAccount).toHaveBeenCalledWith('token-abc');
      expect(logoutUser).toHaveBeenCalled();
    });
  });

  it('handles account delete failure gracefully', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('t');
    (authService.deleteAccount as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const { getByText } = setup();

    fireEvent.press(getByText('Delete Account'));

    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteBtn = alertArgs[2].find((b: any) => b.text === 'Delete');

    await act(async () => deleteBtn.onPress());

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete account.'),
    );
  });

  it('logs out when pressing Sign Out', async () => {
    const { getByText } = setup();

    fireEvent.press(getByText('Sign Out'));

    expect(logoutUser).toHaveBeenCalled();
  });
});
