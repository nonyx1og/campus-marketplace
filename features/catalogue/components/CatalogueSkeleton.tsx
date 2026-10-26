import React, { useEffect, useState } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/theme';

export const CatalogueSkeletonItem: React.FC = () => {
  const theme = useTheme();
  const [opacityAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  };

  const imagePlaceholderStyle: ViewStyle = {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.sm,
  };

  const badgePlaceholderStyle: ViewStyle = {
    width: 80,
    height: 20,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.xs,
  };

  const titlePlaceholderStyle: ViewStyle = {
    width: '85%',
    height: 22,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.xs,
  };

  const textPlaceholderStyle: ViewStyle = {
    width: '60%',
    height: 16,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.sm,
  };

  const footerPlaceholderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    paddingTop: theme.spacing.xs,
  };

  const pricePlaceholderStyle: ViewStyle = {
    width: 100,
    height: 24,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceSubtle,
  };

  return (
    <View style={cardStyle} accessibilityRole="none" accessibilityLabel="Đang tải dữ liệu sản phẩm">
      <Animated.View style={[imagePlaceholderStyle, { opacity: opacityAnim }]} />
      <Animated.View style={[badgePlaceholderStyle, { opacity: opacityAnim }]} />
      <Animated.View style={[titlePlaceholderStyle, { opacity: opacityAnim }]} />
      <Animated.View style={[textPlaceholderStyle, { opacity: opacityAnim }]} />
      <View style={footerPlaceholderStyle}>
        <Animated.View style={[pricePlaceholderStyle, { opacity: opacityAnim }]} />
      </View>
    </View>
  );
};

export const CatalogueSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <CatalogueSkeletonItem key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

export default CatalogueSkeleton;
