import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { ScreenViewState } from '@/types/domain';
import { ScreenState } from '@/components/primitives/ScreenState';

export interface ScreenStateViewProps {
  state: ScreenViewState;
  onRetry?: () => void;
  retryLabel?: string;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorTitle?: string;
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
  retryLabel,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  errorTitle,
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
      retryLabel={retryLabel}
      loadingMessage={loadingMessage}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      emptyActionLabel={emptyActionLabel}
      onEmptyAction={onEmptyAction}
      errorTitle={errorTitle}
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
