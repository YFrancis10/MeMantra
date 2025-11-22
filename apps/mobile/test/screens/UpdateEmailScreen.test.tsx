import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdateEmailScreen from '../../screens/UpdateEmailScreen';
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
    updateEmail: jest.fn(),
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
  (storage.getUserData as jest.Mock).mockResolvedValue({
    email: 'test@example.com',
    username: 'testuser',
  });
  (storage.getToken as jest.Mock).mockResolvedValue('mock-token');

  mockUseNavigation.mockReturnValue(mockNavigation);
});

describe('UpdateEmailScreen', () => {
  it('renders correctly with email input and save button', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      expect(getByText('Update Email')).toBeTruthy();
      expect(getByText('Save Email')).toBeTruthy();
      expect(getByPlaceholderText('Enter new email')).toBeTruthy();
    });
  });

  it('loads user email on mount', async () => {
    const { getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      expect(input.props.value).toBe('test@example.com');
    });
  });

  it('updates email input when text changes', async () => {
    const { getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      fireEvent.changeText(input, 'newemail@example.com');
      expect(input.props.value).toBe('newemail@example.com');
    });
  });

  it('calls goBack when back button is pressed', async () => {
    const { getByText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('← Back'));
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('successfully updates email and logs out user', async () => {
    (authService.updateEmail as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    const { getByText, getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      fireEvent.changeText(input, 'newemail@example.com');
    });

    fireEvent.press(getByText('Save Email'));

    await waitFor(() => {
      expect(authService.updateEmail).toHaveBeenCalledWith('newemail@example.com', 'mock-token');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Email Updated',
        'Your email has been changed. You will be logged out for security reasons.',
        expect.any(Array),
      );
    });

    // Simulate pressing OK on alert
    const okCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
    okCallback();

    expect(logoutUser).toHaveBeenCalledWith(mockNavigation);
  });

  it('shows error alert when not authenticated', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<UpdateEmailScreen />);

    await waitFor(() => {});

    fireEvent.press(getByText('Save Email'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Not authenticated.');
    });
  });

  it('shows error alert when update email fails', async () => {
    (authService.updateEmail as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      fireEvent.changeText(input, 'newemail@example.com');
    });

    fireEvent.press(getByText('Save Email'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error');
    });
  });

  it('shows generic error message when error has no message', async () => {
    (authService.updateEmail as jest.Mock).mockRejectedValue({});

    const { getByText, getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      fireEvent.changeText(input, 'newemail@example.com');
    });

    fireEvent.press(getByText('Save Email'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update email.');
    });
  });

  it('handles empty email from getUserData', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue(null);

    const { getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      expect(input.props.value).toBe('');
    });
  });

  it('handles getUserData returning user without email', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue({
      username: 'testuser',
    });

    const { getByPlaceholderText } = render(<UpdateEmailScreen />);

    await waitFor(() => {
      const input = getByPlaceholderText('Enter new email');
      expect(input.props.value).toBe('');
    });
  });
});
