import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

export type ThemedButtonProps = PressableProps & {
  onPress?: () => void;
  content?: string;
  lightColor?: string;
  darkColor?: string;
  size?: 'small' | 'medium' | 'large';
};

export function ThemedButton({
  style,
  onPress,
  content,
  lightColor,
  darkColor,
  size = 'medium',
  ...rest
}: ThemedButtonProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <ThemedView
      style={[
        { backgroundColor: color },
        size === 'small' ? styles.smallView : undefined,
        size === 'medium' ? styles.mediumView : undefined,
        size === 'large' ? styles.largeView : undefined,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          { backgroundColor: 'purple', },
          size === 'small' ? styles.smallButton : undefined,
          size === 'medium' ? styles.mediumButton : undefined,
          size === 'large' ? styles.largeButton : undefined,
        ]}
        {...rest}
      >
        <ThemedText
          style={[
            size === 'small' ? styles.smallText : undefined,
            size === 'medium' ? styles.mediumText : undefined,
            size === 'large' ? styles.largeText : undefined,
          ]}
        >{content}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  smallView: {
    borderRadius: 8,
  },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 16,
  },
  mediumView: {
    borderRadius: 12,
  },
  mediumButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  mediumText: {
    fontSize: 18,
    lineHeight: 20,
  },
  largeView: {
    borderRadius: 20,
  },
  largeButton: {
    borderRadius: 20,
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  largeText: {
    fontSize: 24,
    lineHeight: 28,
  },
});
