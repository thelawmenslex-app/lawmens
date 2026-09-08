import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * 3D Law Scales Animated Component
 * Features:
 * - 3D Perspective rotation around Y and Z axes (swaying & depth)
 * - Oscillating scales of justice beam
 * - Pulsating concentric energy rings
 * - Smooth spring & easing loop
 */
export default function LawAnimation3D({ size = 110, color = '#25AAE2' }) {
  const swayAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const depthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. 3D Sway Animation (Tilting Scales)
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Pulsating Glow Ring Animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. 3D Depth / Perspective Y-Rotation
    const depthLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(depthAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(depthAnim, {
          toValue: -1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    swayLoop.start();
    pulseLoop.start();
    depthLoop.start();

    return () => {
      swayLoop.stop();
      pulseLoop.stop();
      depthLoop.stop();
    };
  }, []);

  // Interpolations
  const rotateZ = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

  const rotateY = depthAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-22deg', '0deg', '22deg'],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.06],
  });

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.25],
  });

  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0.0],
  });

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {/* Outer Pulsating Ring (3D depth) */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size * 1.35,
            height: size * 1.35,
            borderRadius: (size * 1.35) / 2,
            borderColor: color,
            transform: [{ scale: ringScale }, { perspective: 800 }, { rotateY }],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Middle Glowing Disc */}
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: size * 1.15,
            height: size * 1.15,
            borderRadius: (size * 1.15) / 2,
            backgroundColor: 'rgba(37, 170, 226, 0.08)',
            transform: [{ scale }],
          },
        ]}
      />

      {/* 3D Tilting Scales Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              { perspective: 900 },
              { rotateY },
              { rotateZ },
              { scale },
            ],
          },
        ]}
      >
        <MaterialCommunityIcons name="scale-balance" size={size * 0.58} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 170, 226, 0.25)',
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#25AAE2',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});
