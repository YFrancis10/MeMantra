import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import BookmarkScreen from '../../screens/bookmarkScreen';
import { mantraService } from '../../services/mantra.service';
import { storage } from '../../utils/storage';
import { SavedProvider } from '../../context/SavedContext';

// Mock dependencies
jest.mock('../../services/mantra.service', () => ({
  mantraService: {
    getSavedMantras: jest.fn(),
  },
}));

jest.mock('../../utils/storage', () => ({
  storage: {
    getToken: jest.fn(),
  },
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#1a1a1a',
      primaryDark: '#2a2a2a',
      text: '#ffffff',
    },
  }),
}));

describe('BookmarkScreen', () => {
  const mockNavigate = jest.fn();
  const mockNavigation = { navigate: mockNavigate };

  const mockMantras = [
    {
      mantra_id: 1,
      title: 'Test Mantra 1',
      key_takeaway: 'Takeaway 1',
      created_at: '2024-01-01',
      is_active: true,
    },
    {
      mantra_id: 2,
      title: 'Test Mantra 2',
      key_takeaway: 'Takeaway 2',
      created_at: '2024-01-02',
      is_active: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getToken as jest.Mock).mockResolvedValue('test-token');
  });

  const renderScreen = () =>
    render(
      <SavedProvider>
        <BookmarkScreen navigation={mockNavigation} />
      </SavedProvider>,
    );

  it('renders the screen with title', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue([]);
    const { getByText } = renderScreen();
    
    await waitFor(() => {
      expect(getByText('Library')).toBeTruthy();
    });
  });

  it('displays empty state when no saved mantras', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue([]);
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('You have no saved mantras yet.')).toBeTruthy();
    });
  });

  it('loads and displays saved mantras on mount', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue(mockMantras);
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(mantraService.getSavedMantras).toHaveBeenCalledWith('test-token');
      expect(getByText('Test Mantra 1')).toBeTruthy();
      expect(getByText('Test Mantra 2')).toBeTruthy();
    });
  });

  it('uses fallback token when getToken returns null', async () => {
    (storage.getToken as jest.Mock).mockResolvedValue(null);
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue([]);
    renderScreen();

    await waitFor(() => {
      expect(mantraService.getSavedMantras).toHaveBeenCalledWith('mock-token');
    });
  });

  it('handles error when loading saved mantras fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    (mantraService.getSavedMantras as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Error fetching saved mantras:',
        expect.any(Error),
      );
      expect(getByText('You have no saved mantras yet.')).toBeTruthy();
    });

    consoleLogSpy.mockRestore();
  });

  it('navigates to Focus screen when mantra is pressed', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue(mockMantras);
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Test Mantra 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Test Mantra 1'));

    expect(mockNavigate).toHaveBeenCalledWith('Focus', {
      mantra: mockMantras[0],
    });
  });

  it('displays mantras in a grid layout', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue(mockMantras);
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Test Mantra 1')).toBeTruthy();
      expect(getByText('Test Mantra 2')).toBeTruthy();
    });

    // Both mantras should be visible
    expect(getByText('Test Mantra 1')).toBeTruthy();
    expect(getByText('Test Mantra 2')).toBeTruthy();
  });

  it('truncates long mantra titles with numberOfLines prop', async () => {
    const longTitleMantra = [
      {
        mantra_id: 3,
        title: 'This is a very long mantra title that should be truncated after three lines',
        key_takeaway: 'Takeaway',
        created_at: '2024-01-03',
        is_active: true,
      },
    ];
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue(longTitleMantra);
    const { getByText } = renderScreen();

    await waitFor(() => {
      const titleElement = getByText(
        'This is a very long mantra title that should be truncated after three lines',
      );
      expect(titleElement.props.numberOfLines).toBe(3);
    });
  });

  it('renders each mantra with correct styling', async () => {
    (mantraService.getSavedMantras as jest.Mock).mockResolvedValue(mockMantras);
    const { getByText } = renderScreen();

    await waitFor(() => {
      const mantraText = getByText('Test Mantra 1');
      // Check that the element has styling applied
      expect(mantraText.props.style).toBeDefined();
      expect(Array.isArray(mantraText.props.style)).toBe(true);
    });
  });
});

