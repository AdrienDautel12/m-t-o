import React, { useEffect, useState } from 'react';
import { ImageBackground, Image, StyleSheet, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';

const backgroundImage = require('./assets/cloud.jpg');
const icontemp = require('./assets/temperature.png');


const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        // Demander la permission d'accéder à la localisation
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.error('Permission de localisation refusée');
          return;
        }

        const getWeatherIconUrl = (iconCode) => {
          return `http://openweathermap.org/img/w/${iconCode}.png`;
        };

        // Obtenir la localisation actuelle
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        // Construire l'URL avec la localisation actuelle
        const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&appid=7108013bc077e8019ccd5b10896df753&units=metric&lang=fr`;

        // Effectuer la requête à l'API et mettre à jour les données météo
        const response = await fetch(apiURL);
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'API :', error);
      }
    };

    getLocationAndWeather();
  }, []);

  const groupForecastsByDay = (forecasts) => {
    const groupedForecasts = {};

    forecasts.forEach((forecast) => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!groupedForecasts[date]) {
        groupedForecasts[date] = [];
      }
      groupedForecasts[date].push(forecast);
    });

    return groupedForecasts;
  };
  const groupedForecasts = weatherData && weatherData.list ? groupForecastsByDay(weatherData.list) : {};

  // Fonction pour obtenir l'URL de l'icône en fonction de l'ID fourni par l'API

  const getWeatherIconUrl = (iconCode) => {
    return `http://openweathermap.org/img/w/${iconCode}.png`;
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.image}>
        {weatherData && weatherData.list && weatherData.list.length > 0 && (
          <View style={styles.outerContainer}>
            <View style={styles.weatherContainer}>
              <View style={styles.centered}>
                <Text style={styles.cityName}>{weatherData.city.name}</Text>
                <View style={styles.horizontal}>
                  <Text style={styles.temperature}>
                    {`${weatherData.list[0].main.temp}°C`}
                  </Text>
                  <Text style={styles.weatherDescription}>
                    {weatherData.list[0].weather[0].description.charAt(0).toUpperCase() + weatherData.list[0].weather[0].description.slice(1)}
                  </Text>
                  <View>
                    <Image source={{ uri: getWeatherIconUrl(weatherData.list[0].weather[0].icon) }} style={styles.weatherIcon} />
                  </View>
                  <Text style={styles.additionalInfo}>{`Humidité: ${weatherData.list[0].main.humidity}%`}</Text>
                  <Text style={styles.additionalInfo}>{`Vent: ${weatherData.list[0].wind.speed} m/s`}</Text>
                </View>
              </View>
            </View>
            <View style={styles.temperatureContainer}>
              <View style={styles.temperatureMinMaxContainer}>
                <Text style={styles.additionalInfo}>Min: {`${weatherData.list[0].main.temp_min}°C`}</Text>
                <Image source={icontemp} style={styles.smallImage} />
                <Text style={styles.additionalInfo}>Max: {`${weatherData.list[0].main.temp_max}°C`}</Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                {Object.keys(groupedForecasts).map((date, index) => (
                  <View key={index} style={{ marginRight: 10 }}>
                    <Text style={styles.dayText}>
                      {new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      }).charAt(0).toUpperCase() +
                        new Date(date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        }).slice(1)}
                    </Text>
                    <ScrollView>
                      {groupedForecasts[date].map((forecast, subIndex) => (
                        <View key={subIndex} style={styles.forecastItem}>
                          <Text>{new Date(forecast.dt_txt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                          <Image
                            source={{ uri: getWeatherIconUrl(forecast.weather[0].icon) }}
                            style={{ width: 50, height: 50 }}
                          />
                          <Text>{`${forecast.main.temp}°C`}</Text>
                          <Text>{forecast.weather[0].description.charAt(0).toUpperCase() + forecast.weather[0].description.slice(1)}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Aligner le contenu en bas de l'écran
  },
  image: {
    flex: 1,
    justifyContent: 'center', // Aligner l'image en haut de l'écran
  },
  smallImage: {
    width: 40,
    height: 40,
  },
  seehours: {
    color: 'black',
    fontSize: 24,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  forecastItem: {
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginRight: 15,
  },
  outerContainer: {
    flex: 1,
    margin: 20, // Ajouter une marge autour du conteneur extérieur
    width: 'auto',
  },
  iconContainer: {
    alignItems: 'flex-start', // Centrer l'icône
    marginTop: 20, // Ajouter une marge entre l'icône et le reste du contenu
  },
  iconBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Arrière-plan semi-transparent
    borderRadius: 50, // Bordure arrondie pour créer un cercle
    padding: 10, // Ajouter un espace autour de l'icône
    marginLeft: 200, // Ajouter une marge à droite pour séparer l'icône des autres éléments
  },
  weatherIcon: {
    width: 60, // Ajuste la taille de l'icône selon tes préférences
    height: 60,
    // Assure-toi que la bordure est la moitié de la taille de l'icône pour maintenir la forme circulaire
  },
  weatherContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
    marginTop: 20, // Ajouter une marge entre l'icône et le reste du contenu
  },
  centered: {
    alignItems: 'flex-start', // Centrer les éléments dans la vue
  },
  horizontal: {
    flexDirection: 'column', // Aligner les éléments horizontalement
    justifyContent: 'space-between', // Espacement équitable entre les éléments
    marginTop: 10, // Ajouter un espace entre les sections
  },
  cityName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  temperatureContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  temperatureMinMaxContainer: {
    flexDirection: 'row', // Aligner les éléments horizontalement
    justifyContent: 'space-between', // Espacement équitable entre les éléments
    marginBottom: 10, // Ajouter un espace entre les sections
  },
  temperature: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  timeContainer: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: 'auto',
  },
  timebyhoursContainer: {
    flexDirection: 'row', // Aligner les éléments horizontalement
    justifyContent: 'space-between', // Espacement équitable entre les éléments
    marginBottom: 10, // Ajouter un espace entre les sections
  },
  weatherDescription: {
    color: 'white',
    fontSize: 18,
  },
  additionalInfo: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
