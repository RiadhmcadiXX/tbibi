import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StarRating from 'react-native-star-rating';

export default function ReviewStars() {
  const [rating, setRating] = useState(4.5);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating</Text>
      <StarRating
        disabled={false} // set to false if you want it to be interactive
        maxStars={5}
        rating={rating}
        starSize={24}
        fullStarColor="#FFD700"
        emptyStarColor="#E0E0E0"
      />
      <Text style={styles.text}>{rating} out of 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
});
