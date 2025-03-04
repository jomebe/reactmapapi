import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';
import axios from 'axios';
import { KAKAO_API_KEY } from '@env';

interface Place {
  place_name: string;
  x: string;  // longitude
  y: string;  // latitude
  address_name: string;
}

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const searchPlaces = async () => {
    try {
      const response = await axios.get(
        'https://dapi.kakao.com/v2/local/search/keyword.json',
        {
          params: {
            query: searchText,
            size: 15,
            sort: 'accuracy',
            analyze_type: 'exact',
            page: 1,
          },
          headers: {
            Authorization: KAKAO_API_KEY
          }
        }
      );

      const places = response.data.documents;
      setPlaces(places);
      
      if (places.length > 0) {
        setRegion({
          latitude: parseFloat(places[0].y),
          longitude: parseFloat(places[0].x),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="장소를 검색하세요"
        />
        <Pressable style={styles.searchButton} onPress={searchPlaces}>
          <Text style={styles.buttonText}>검색</Text>
        </Pressable>
      </View>

      <MapView 
        style={styles.map}
        region={region}
      >
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(place.y),
              longitude: parseFloat(place.x),
            }}
            title={place.place_name}
            description={place.address_name}
          />
        ))}
      </MapView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 50,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#0080ff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
});
