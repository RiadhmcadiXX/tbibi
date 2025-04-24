import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

export function ReviewBar({ label, percent }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  return (
    <View style={styles.barContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: `${widthAnim._value}%` }]}
        />
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
    barContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
      color: '#333',
    },
    track: {
      height: 14,
      backgroundColor: '#EEE',
      borderRadius: 7,
      overflow: 'hidden',
    },
    fill: {
      height: 14,
      backgroundColor: '#0CB8B6',
      borderRadius: 7,
    },
  });
  