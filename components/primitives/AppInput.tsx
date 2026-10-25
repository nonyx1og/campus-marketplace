import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '@/constants/theme';

export interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
  onClear?: () => void;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  accessibilityLabel,
  accessibilityRole = 'none',
  accessibilityHint,
  leftIcon,
  rightIcon,
  showClearButton = false,
  onClear,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  testID,
  style,
  inputStyle,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasError = Boolean(error);
  const resolvedAccessibilityLabel =
    accessibilityLabel || label || placeholder || 'Trường nhập văn bản';

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const containerStyle: ViewStyle = {
    marginBottom: theme.spacing.md,
  };

  const inputWrapperStyle: ViewStyle = {
    minHeight: multiline ? 88 : theme.layout.minTouchTarget, // Enforce min 44 touch target
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: hasError
      ? theme.colors.danger
      : isFocused
      ? theme.colors.primary
      : theme.colors.border,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    paddingHorizontal: theme.spacing.sm,
    opacity: editable ? 1 : 0.6,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    minHeight: multiline ? 80 : theme.layout.minTouchTarget,
    fontSize: theme.typography.fontSizes.md,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.text,
    paddingVertical: multiline ? theme.spacing.sm : theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  };

  const iconControlStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget, // Mandatory min 44x44 for touch control
    minHeight: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: hasError ? theme.colors.danger : theme.colors.text,
    marginBottom: theme.spacing.xxs,
  };

  const helperStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: hasError ? theme.colors.danger : theme.colors.mutedText,
    marginTop: theme.spacing.xxs,
  };

  const iconTextStyle: TextStyle = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.typography.fontWeights.medium,
  };

  return (
    <View style={[containerStyle, style]}>
      {label && <Text style={labelStyle}>{label}</Text>}

      <View style={inputWrapperStyle}>
        {leftIcon && <View style={styles.iconSlot}>{leftIcon}</View>}

        <TextInput
          testID={testID}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={resolvedAccessibilityLabel}
          accessibilityHint={accessibilityHint}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedText}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[textInputStyle, inputStyle]}
        />

        {/* Clear Button control */}
        {showClearButton && value.length > 0 && editable && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Xóa nội dung ${label || 'ô nhập'}`}
            onPress={handleClear}
            style={iconControlStyle}
          >
            <Text style={iconTextStyle}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Password visibility toggle control */}
        {secureTextEntry && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
            }
            onPress={togglePasswordVisibility}
            style={iconControlStyle}
          >
            <Text style={iconTextStyle}>{isPasswordVisible ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}

        {rightIcon && <View style={styles.iconSlot}>{rightIcon}</View>}
      </View>

      {(hasError || helperText) && (
        <Text
          style={helperStyle}
          accessibilityRole={hasError ? 'alert' : 'text'}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconSlot: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppInput;
