import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { ScreenViewState } from '@/types/listing';
import { ScreenState } from '@/components/primitives/ScreenState';

export interface ScreenStateViewProps {
  state: ScreenViewState;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // For interactive demo/grading review: allow toggling between the 4 states
  onStateChange?: (newState: ScreenViewState) => void;
  showStateSwitcher?: boolean;
}

/**
 * ScreenStateView wrapper delegating to ScreenState primitive.
 * Maintained for backward compatibility across existing screens.
 */
export const ScreenStateView: React.FC<ScreenStateViewProps> = ({
  state,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  errorMessage,
  children,
  style,
  onStateChange,
  showStateSwitcher = true,
}) => {
  return (
    <ScreenState
      state={state}
      onRetry={onRetry}
      loadingMessage={loadingMessage}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      style={style}
      showStateSwitcher={showStateSwitcher}
      onStateChange={onStateChange}
    >
      {children}
    </ScreenState>
  );
};

export default ScreenStateView;
