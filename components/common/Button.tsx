import React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { AppButton, AppButtonProps } from '@/components/primitives/AppButton';

export interface ButtonProps extends AppButtonProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Common Button component delegating to the AppButton primitive.
 */
export const Button: React.FC<ButtonProps> = (props) => {
  return <AppButton {...props} />;
};

export default Button;
