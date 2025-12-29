import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ResetPasswordScreen from '../../screens/ResetPasswordScreen';
import { authService } from '../../services/auth.service';

jest.mock('../../services/auth.service');
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#9AA793',
      secondary: '#E6D29C',
      placeholderText: '#999',
    },
  }),
}));

jest.spyOn(Alert, 'alert');

describe('ResetPasswordScreen', () => {
  let mockNavigation: any;
  let mockRoute: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation = {
      navigate: jest.fn(),
      reset: jest.fn(),
    };
    mockRoute = {
      params: {
        email: 'test@example.com',
        code: '123456',
      },
    };
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    expect(getAllByText('Reset Password').length).toBeGreaterThan(0);
    expect(getByPlaceholderText('New Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm New Password')).toBeTruthy();
  });

  it('shows error when password is too short', async () => {
    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), '12345');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), '12345');
    fireEvent.press(getAllByText('Reset Password')[1]); // Button, not title

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 8 characters');
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), 'password456');
    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
    });
  });

  it('successfully resets password', async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), 'newpassword123');
    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'newpassword123',
      );
    });
  });

  it('shows error when API fails', async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValue({
      status: 'error',
      message: 'Invalid code',
    });

    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), 'newpassword123');
    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid code');
    });
  });

  it('shows error when fields are empty', async () => {
    const { getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });
  });

  it('handles API exception with custom error message', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Custom error message' } },
    });

    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), 'newpassword123');
    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Custom error message');
    });
  });

  it('handles API exception without custom message', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getAllByText } = render(
      <ResetPasswordScreen route={mockRoute} navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
    fireEvent.changeText(getByPlaceholderText('Confirm New Password'), 'newpassword123');
    fireEvent.press(getAllByText('Reset Password')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to reset password. Please try again.',
      );
    });
  });
});
