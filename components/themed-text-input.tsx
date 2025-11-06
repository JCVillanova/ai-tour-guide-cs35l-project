import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  value?: string;
  placeholder?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  value,
  placeholder,
  ...rest
}: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const colors = {
    color,
    borderColor: useThemeColor({ light: lightColor, dark: darkColor }, 'text'),
  }

  return (
    <TextInput
      style={[
        colors,
        styles.default,
        style,
      ]}
      value={value}
      placeholder={placeholder}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    borderRadius: 4,
    borderWidth: 0.5,
    fontSize: 18,
    height: 40,
    padding: 8,
  }
});
