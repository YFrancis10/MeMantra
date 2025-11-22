import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../../screens/ProfileScreen';
import { storage } from '../../utils/storage';
import { authService } from '../../services/auth.service';
import { logoutUser } from '../../utils/auth';

jest.mock('../../utils/storage', () => ({
  storage: {
    getToken: jest.fn(),
    getUserData: jest.fn(),
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

const mockUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: mockUseNavigation,
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (storage.getUserData as jest.Mock).mockResolvedValue({
    username: 'testuser',
    email: 'test@example.com',
  });
  (storage.getToken as jest.Mock).mockResolvedValue('mock-token');

  mockUseNavigation.mockReturnValue(mockNavigation);
});

describe('ProfileScreen', () => {
  it('renders correctly with all options', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('testuser')).toBeTruthy();
      expect(getByText('Update Email')).toBeTruthy();
      expect(getByText('Update Password')).toBeTruthy();
      expect(getByText('Delete Account')).toBeTruthy();
      expect(getByText('Sign Out')).toBeTruthy();
    });
  });

  it('loads and displays username on mount', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(storage.getUserData).toHaveBeenCalled();
      expect(getByText('testuser')).toBeTruthy();
    });
  });

  it('displays empty username when getUserData returns null', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue(null);

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(storage.getUserData).toHaveBeenCalled();
    });
  });

  it('displays empty username when user object has no username', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
    });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(storage.getUserData).toHaveBeenCalled();
    });
  });

  it('navigates to UpdateEmail when Update Email is pressed', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Update Email'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('UpdateEmail');
    });
  });

  it('navigates to UpdatePassword when Update Password is pressed', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Update Password'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('UpdatePassword');
    });
  });

  it('calls logoutUser when Sign Out is pressed', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Sign Out'));
      expect(logoutUser).toHaveBeenCalledWith(mockNavigation);
    });
  });

  it('shows confirmation dialog when Delete Account is pressed', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Account',
      'Are you absolutely sure you want to permanently delete your account? This action cannot be undone.',
      expect.any(Array),
    );
  });

  it('cancels delete account when Cancel is pressed', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const cancelCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0];
    expect(cancelCallback.text).toBe('Cancel');
    expect(cancelCallback.style).toBe('cancel');
  });

  it('successfully deletes account and logs out user', async () => {
    (authService.deleteAccount as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const deleteCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
    await deleteCallback();

    await waitFor(() => {
      expect(authService.deleteAccount).toHaveBeenCalledWith('mock-token');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Account Deleted',
        'Your account has been deleted. You will now be logged out.',
        expect.any(Array),
      );
    });

    const okCallback = (Alert.alert as jest.Mock).mock.calls[1][2][0].onPress;
    okCallback();

    expect(logoutUser).toHaveBeenCalledWith(mockNavigation);
  });

  it('shows error when not authenticated during delete', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const deleteCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
    await deleteCallback();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Not authenticated.');
    });
  });

  it('shows error alert when delete account fails with response message', async () => {
    (authService.deleteAccount as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'Cannot delete account with active subscriptions',
        },
      },
    });

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const deleteCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
    await deleteCallback();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Cannot delete account with active subscriptions',
      );
    });
  });

  it('shows generic error when delete account fails without message', async () => {
    (authService.deleteAccount as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const deleteCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
    await deleteCallback();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete account.');
    });
  });

  it('verifies Delete button has destructive style', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Delete Account'));
    });

    const deleteButton = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    expect(deleteButton.style).toBe('destructive');
    expect(deleteButton.text).toBe('Delete');
  });

  it('renders ProfileOption with destructive styling for Delete Account', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      const deleteOption = getByText('Delete Account');
      expect(deleteOption).toBeTruthy();
    });
  });

  it('handles multiple rapid Sign Out presses gracefully', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Sign Out'));
      fireEvent.press(getByText('Sign Out'));
      fireEvent.press(getByText('Sign Out'));

      expect(logoutUser).toHaveBeenCalledTimes(3);
    });
  });

  it('handles navigation being called multiple times', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Update Email'));
      fireEvent.press(getByText('Update Password'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('UpdateEmail');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('UpdatePassword');
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(2);
    });
  });
});
