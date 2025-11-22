import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UpdateEmailScreen from '../../screens/UpdateEmailScreen';
import { storage } from '../../utils/storage';
import { authService } from '../../services/auth.service';
import { logoutUser } from '../../utils/auth';

jest.mock('../../utils/storage', () => ({
  storage: {
    getUserData: jest.fn(),
    getToken: jest.fn(),
    saveUserData: jest.fn(),
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

describe('UpdateEmailScreen', () => {
  const setup = () => render(<UpdateEmailScreen />);

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getUserData as jest.Mock).mockResolvedValue({
      email: 'old@mail.com',
    });
  });

  it('loads and displays current email', async () => {
    const { getByDisplayValue } = setup();

    await waitFor(() => {
      expect(getByDisplayValue('old@mail.com')).toBeTruthy();
    });
  });

  it('updates email successfully and logs out', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('token123');
    (authService.updateEmail as jest.Mock).mockResolvedValue({
      data: { email: 'new@mail.com' },
    });

    const { getByText, getByDisplayValue } = setup();

    await waitFor(() => getByDisplayValue('old@mail.com'));

    fireEvent.changeText(getByDisplayValue('old@mail.com'), 'new@mail.com');

    fireEvent.press(getByText('Save Email'));

    await waitFor(() => {
      expect(authService.updateEmail).toHaveBeenCalledWith('new@mail.com', 'token123');
      expect(logoutUser).toHaveBeenCalled();
    });
  });

  it('shows error when update fails', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue('t');
    (authService.updateEmail as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const { getByText } = setup();

    fireEvent.press(getByText('Save Email'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update email.'),
    );
  });

  it('goes back when back button is pressed', async () => {
    const { getByText } = setup();

    // assuming you have a "Back" button text; adjust testID/text as needed
    fireEvent.press(getByText('Back'));

    expect(mockGoBack).toHaveBeenCalled();
  });
});
