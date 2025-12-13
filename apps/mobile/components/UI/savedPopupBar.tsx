import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type SavedPopupBarProps = {
  visible: boolean;
  message?: string;
  onHide: () => void;
  durationMs?: number;
};

export default function SavedPopupBar({
  visible,
  message = 'Saved successfully',
  onHide,
  durationMs = 2000,
}: SavedPopupBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const animateTo = (toValue: 0 | 1, cb?: () => void) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: toValue ? 0 : 10,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && cb?.());
  };

  useEffect(() => {
    if (!visible) return;

    animateTo(1);

    const timer = setTimeout(() => {
      animateTo(0, onHide);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [visible, durationMs, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute left-4 right-4 rounded-xl px-4 py-4 border"
      style={{
        bottom: insets.bottom,
        opacity,
        transform: [{ translateY }],
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
      }}
    >
      <Text className="text-[15px] font-bold" style={{ color: colors.primaryDark ?? '#fff' }}>
        {message}
      </Text>
    </Animated.View>
  );
}
