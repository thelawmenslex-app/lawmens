import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';

/**
 * Card3D Component
 * Provides subtle 3D tilt, depth perspective, and smooth scaling on press.
 */
export default function Card3D({
  children,
  style,
  onPress,
  activeOpacity = 0.9,
  disabled = false,
  tiltAngle = '3deg',
  depthScale = 0.96,
  ...props
}) {
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedTilt = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: depthScale,
        useNativeDriver: true,
        bounciness: 6,
        speed: 16,
      }),
      Animated.spring(animatedTilt, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 4,
        speed: 16,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
        speed: 12,
      }),
      Animated.spring(animatedTilt, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
        speed: 12,
      }),
    ]).start();
  };

  const rotateX = animatedTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', tiltAngle],
  });

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [
              { perspective: 900 },
              { scale: animatedScale },
              { rotateX },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
