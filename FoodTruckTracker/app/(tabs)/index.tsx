// app/(tabs)/index.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const cuisines = ['Tacos', 'Burgers', 'Vegan'];

const mapRef = useRef<MapView>(null);

const trucks = [
  {
    id: 1,
    name: 'Taco Town',
    cuisine: 'Tacos',
    rating: 4.5,
    views: 120,
    latitude: 37.78825,
    longitude: -122.4324,
    logo: require('../../assets/images/taco-happy.png'),
  },
  {
    id: 2,
    name: 'Burger Boss',
    cuisine: 'Burgers',
    rating: 4.2,
    views: 95,
    latitude: 37.78855,
    longitude: -122.4312,
    logo: require('../../assets/images/burger.webp'),
  },
  {
    id: 3,
    name: 'Vegan Vibes',
    cuisine: 'Vegan',
    rating: 4.8,
    views: 110,
    latitude: 37.78725,
    longitude: -122.4334,
    logo: require('../../assets/images/vegan.png'),
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const handleTruckPress = (truck: any) => {
  setSelectedTruck(truck);
  mapRef.current?.animateToRegion(
    {
      latitude: truck.latitude,
      longitude: truck.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },
    500 // animation duration in ms
  );
};


  const filteredTrucks = trucks.filter((truck) => {
    const matchesCuisine = !selectedCuisine || truck.cuisine === selectedCuisine;
    const matchesSearch = truck.name.toLowerCase().includes(search.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search food trucks..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {cuisines.map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            style={[styles.chip, selectedCuisine === cuisine && styles.chipSelected]}
            onPress={() => setSelectedCuisine(cuisine === selectedCuisine ? null : cuisine)}
          >
            <Text style={styles.chipText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          region={{
            latitude: location?.latitude ?? 37.78825,
            longitude: location?.longitude ?? -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {filteredTrucks.map((truck, index) => (
            <Marker
              key={`marker-${index}`} // ✅ must be outside
              coordinate={{ latitude: truck.latitude, longitude: truck.longitude }}
              onPress={() => handleTruckPress(truck)}
            />
          ))}

        </MapView>
      </View>

      <FlatList
        data={filteredTrucks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTruckPress(item)}
            style={[
              styles.truckCard,
              selectedTruck?.id === item.id && styles.selectedTruckCard,
            ]}
          >
            <Image source={item.logo} style={styles.logo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.truckName}>{item.name}</Text>
              <Text style={styles.truckCuisine}>{item.cuisine}</Text>
              <Text style={styles.truckMeta}>
                ⭐ {item.rating} · 👁️ {item.views}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    backgroundColor: '#fff',
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
  },
  filterBar: {
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 40,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: '#ff5733',
  },
  chipText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTruckCard: {
    borderColor: '#ff5733',
    borderWidth: 2,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 10,
  },
  truckName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  truckCuisine: {
    color: '#666',
  },
  truckMeta: {
    fontSize: 12,
    marginTop: 4,
    color: '#999',
  },
});



