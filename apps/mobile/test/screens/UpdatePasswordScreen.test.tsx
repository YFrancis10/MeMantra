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

const mockUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: mockUseNavigation,
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (storage.getToken as jest.Mock).mockResolvedValue('mock-token');

  mockUseNavigation.mockReturnValue(mockNavigation);
});

describe('UpdatePasswordScreen', () => {
  it('renders correctly with password inputs and save button', () => {
    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    expect(getByText('Update Password')).toBeTruthy();
    expect(getByText('Save Password')).toBeTruthy();
    expect(getByPlaceholderText('New password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm password')).toBeTruthy();
  });

  it('calls goBack when back button is pressed', () => {
    const { getByText } = render(<UpdatePasswordScreen />);

    fireEvent.press(getByText('← Back'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('updates password input when text changes', () => {
    const { getByPlaceholderText } = render(<UpdatePasswordScreen />);

    const passwordInput = getByPlaceholderText('New password');
    fireEvent.changeText(passwordInput, 'newpassword123');
    expect(passwordInput.props.value).toBe('newpassword123');
  });

  it('updates confirm password input when text changes', () => {
    const { getByPlaceholderText } = render(<UpdatePasswordScreen />);

    const confirmInput = getByPlaceholderText('Confirm password');
    fireEvent.changeText(confirmInput, 'newpassword123');
    expect(confirmInput.props.value).toBe('newpassword123');
  });

  it('shows error when password is less than 6 characters', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'short');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'short');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters.');
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password456');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match.');
    });
  });

  it('shows error when not authenticated', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Not authenticated.');
    });
  });

  it('successfully updates password and logs out user', async () => {
    (authService.updatePassword as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith('password123', 'mock-token');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Password Updated',
        'Your password has been changed. You will be logged out for security reasons.',
        expect.any(Array),
      );
    });

    // Simulate pressing OK on alert
    const okCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
    okCallback();

    expect(logoutUser).toHaveBeenCalledWith(mockNavigation);
  });

  it('shows error alert when update password fails', async () => {
    (authService.updatePassword as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update password.');
    });
  });

  it('validates password length before making API call', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), '12345');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), '12345');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters.');
      expect(authService.updatePassword).not.toHaveBeenCalled();
    });
  });

  it('validates password match before making API call', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'differentpass');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match.');
      expect(authService.updatePassword).not.toHaveBeenCalled();
    });
  });

  it('handles exactly 6 character password successfully', async () => {
    (authService.updatePassword as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    const { getByText, getByPlaceholderText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByPlaceholderText('New password'), '123456');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), '123456');
    fireEvent.press(getByText('Save Password'));

    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith('123456', 'mock-token');
    });
  });
});
