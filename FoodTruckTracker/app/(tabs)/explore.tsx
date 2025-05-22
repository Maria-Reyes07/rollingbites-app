// app/(tabs)/explore.tsx

import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { trucks } from '../data/trucks';

const { width } = Dimensions.get('window');

type Truck = {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  logo: any;
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const animatedScales = useRef(
    trucks.map(() => useSharedValue(1))
  ).current;

  const handleMarkerPress = (index: number) => {
    animatedScales[index].value = withSpring(1.5, { damping: 5 });
    setTimeout(() => {
      animatedScales[index].value = withSpring(1);
    }, 300);

    flatListRef.current?.scrollToIndex({ index, animated: true });

    setSelectedTruck(trucks[index]);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {trucks.map((truck, index) => {
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: animatedScales[index].value }],
          }));

          return (
            <Marker
              key={truck.id}
              coordinate={{
                latitude: truck.latitude,
                longitude: truck.longitude,
              }}
            >

              <Animated.View style={animatedStyle}>
                <Image
                  source={truck.logo}
                  style={{ width: 40, height: 40 }}
                />
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      <FlatList
        ref={flatListRef}
        horizontal
        data={trucks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleMarkerPress(index)}
            style={styles.card}
          >
            <Image source={item.logo} style={styles.logo} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />

      <Modal visible={!!selectedTruck} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedTruck?.name}</Text>
            <Text>{selectedTruck?.description}</Text>
            <TouchableOpacity
              onPress={() => setSelectedTruck(null)}
              style={styles.closeBtn}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    position: 'absolute',
    bottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 12,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
