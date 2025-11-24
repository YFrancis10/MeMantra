import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export default function AppText(props: Readonly<TextProps>) {
  return (
    <Text {...props} style={[styles.text, props.style]}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'LibreBaskerville-Regular',
    color: '#222',
  },
});
