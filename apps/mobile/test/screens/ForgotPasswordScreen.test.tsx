import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ForgotPasswordScreen from '../../screens/ForgotPasswordScreen';
import { authService } from '../../services/auth.service';
import * as ThemeContext from '../../context/ThemeContext';

jest.mock('../../services/auth.service', () => ({
  authService: {
    forgotPassword: jest.fn(),
  },
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      primary: '#9AA793',
      secondary: '#E6D29C',
      placeholderText: '#999',
    },
  })),
}));

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (ThemeContext.useTheme as jest.Mock).mockReturnValue({
    colors: {
      primary: '#9AA793',
      secondary: '#E6D29C',
      placeholderText: '#999',
    },
  });
});

describe('ForgotPasswordScreen', () => {
  it('renders correctly with all elements', () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    expect(getByText('Forgot Password?')).toBeTruthy();
    expect(getByText(/Enter your email address/i)).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Send Code')).toBeTruthy();
    expect(getByText(/Remember your password?/i)).toBeTruthy();
    expect(getByText('Back to Login')).toBeTruthy();
  });

  it('shows error when email field is empty', async () => {
    const { getByText } = render(<ForgotPasswordScreen navigation={mockNavigation} />);

    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email address');
    });
  });

  it('shows error for invalid email format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });
  });

  it('shows error for email without @ symbol', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalidemail.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });
  });

  it('shows error for email without domain', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });
  });

  it('shows error for email with spaces', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user @example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });
  });

  it('successfully sends verification code and navigates', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 'success',
      message: 'Verification code sent to your email',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Verification code sent to your email',
        expect.any(Array),
      );
    });

    // Simulate pressing OK on alert
    const alertCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
    alertCallback();

    expect(mockNavigation.navigate).toHaveBeenCalledWith('VerifyCode', {
      email: 'test@example.com',
    });
  });

  it('trims and lowercases email before sending', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 'success',
      message: 'Verification code sent to your email',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), '  TEST@EXAMPLE.COM  ');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows error when API returns error status', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 'error',
      message: 'User not found',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'User not found');
    });
  });

  it('shows error when API throws exception', async () => {
    (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to send verification code. Please try again.',
      );
    });
  });

  it('shows custom error message from API response', async () => {
    (authService.forgotPassword as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'Rate limit exceeded',
        },
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Rate limit exceeded');
    });
  });

  it('disables input and button while loading', async () => {
    (authService.forgotPassword as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ status: 'success' }), 1000)),
    );

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    const emailInput = getByPlaceholderText('Email');
    const sendButton = getByText('Send Code');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(sendButton);

    // Check loading state
    await waitFor(() => {
      expect(getByText('Sending...')).toBeTruthy();
    });
  });

  it('navigates back to login when pressing Back to Login', () => {
    const { getByText } = render(<ForgotPasswordScreen navigation={mockNavigation} />);

    fireEvent.press(getByText('Back to Login'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('accepts valid email with subdomain', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 'success',
      message: 'Code sent',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@mail.example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('user@mail.example.com');
    });
  });

  it('accepts valid email with plus sign', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 'success',
      message: 'Code sent',
    });

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user+test@example.com');
    fireEvent.press(getByText('Send Code'));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('user+test@example.com');
    });
  });
});
