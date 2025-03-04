import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';
import * as Location from 'expo-location';

interface SearchResult {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const searchLocation = async () => {
    try {
      // 위치 권한 요청
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 오류', '위치 접근 권한이 필요합니다.');
        return;
      }

      // 검색어로 위치 검색
      const geocodeResult = await Location.geocodeAsync(searchText);
      
      if (geocodeResult.length > 0) {
        const location = geocodeResult[0];
        
        // 검색 결과 저장
        setSearchResults([{
          latitude: location.latitude,
          longitude: location.longitude,
          name: searchText,
          address: searchText // geocodeAsync는 주소를 반환하지 않아서 검색어로 대체
        }]);

        // 지도 이동
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert('검색 실패', '검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      Alert.alert('오류', '위치 검색 중 오류가 발생했습니다.');
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
          onSubmitEditing={searchLocation}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={searchLocation}>
          <Text style={styles.buttonText}>검색</Text>
        </Pressable>
      </View>

      <MapView 
        style={styles.map}
        region={region}
      >
        {searchResults.map((result, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: result.latitude,
              longitude: result.longitude
            }}
            title={result.name}
            description={result.address}
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
