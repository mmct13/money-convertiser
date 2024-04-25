// Import des composants nécessaires depuis React Native
import { View, Text, StyleSheet, TextInput, Image, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker'; // Import du composant Picker pour la sélection d'options
import { StatusBar } from 'expo-status-bar'; // Import du composant StatusBar pour gérer la barre d'état
import LottieView from 'lottie-react-native'; // Import de LottieView
import { API_KEY } from './secret';
// Déclaration du composant CurrencyConverter
const CurrencyConverter = () => {
  // Déclaration des états pour suivre les valeurs de la devise source, de la devise cible, du taux de change, et du montant à convertir
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('XOF');
  const [exRates, setExRates] = useState(0); // Taux de change
  const [amount, setAmount] = useState(1); // Montant à convertir
  const [currencies, setCurrencies] = useState([]); // Tableau des options de devises
  const [isLoading, setIsLoading] = useState(true); // État pour contrôler l'affichage de l'animation

  // Fonction pour convertir la devise
  const convertCurrency = () => {
    let result = (amount * exRates).toFixed(2);
    return result;
  }

  // Récupération de l'année actuelle pour l'affichage du copyright
  const date = new Date();
  const year = date.getFullYear();

  // Effet secondaire déclenché lorsque la devise cible est modifiée
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/EUR`
        );
        const data = await response.json();
        // Mise à jour du tableau des devises disponibles et du taux de change
        setCurrencies(Object.keys(data.conversion_rates));
        setExRates(data.conversion_rates[toCurrency]);
      } catch (error) {
        Alert('Erreur' + error);
      } finally {
        setIsLoading(false); // Définir isLoading sur false une fois que les données sont chargées
      }
    };
    fetchCurrencies();
  }, [toCurrency]);

  // Effet secondaire déclenché lorsque la devise source ou la devise cible est modifiée
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
        );
        const data = await response.json();
        // Mise à jour du taux de change en fonction de la devise source et de la devise cible
        setExRates(data.conversion_rates[toCurrency]);
      } catch (error) {
        Alert('Erreur ' + error);
      }
    };
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  // Utilisez setTimeout pour masquer l'animation après 2 secondes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout); // Nettoyez le timeout lors du démontage du composant
  }, []);

  // Rendu de l'interface utilisateur
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {isLoading ? ( // Afficher l'animation si isLoading est true
          <LottieView
            source={require('./assets/splash-animation.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        ) : (
          <>
            <StatusBar hidden />
            <Image source={require('./images/icon.png')} style={styles.image} />
            <Text style={styles.title}>Convertisseur de devises</Text>
            <TextInput
              style={styles.input}
              value={amount.toString()}
              onChangeText={(text) => {
                if (text.trim() === '') {
                  setAmount(0); // Mettre à jour le montant à 0 si le champ est vide
                } else {
                  setAmount(parseFloat(text));
                }
              }}
              keyboardType='numeric'
            />
            <View style={styles.pickerContainer}>
              {/* Sélecteur pour la devise source */}
              <Picker
                style={styles.picker}
                selectedValue={fromCurrency}
                onValueChange={(itemValue) => setFromCurrency(itemValue)}>
                {currencies.map((currency, index) => (
                  <Picker.Item key={index} label={currency} value={currency} />
                ))}
              </Picker>
              {/* Sélecteur pour la devise cible */}
              <Picker
                style={styles.picker}
                selectedValue={toCurrency}
                onValueChange={(itemValue) => setToCurrency(itemValue)}>
                {currencies.map((currency, index) => (
                  <Picker.Item key={index} label={currency} value={currency} />
                ))}
              </Picker>
            </View>
            {/* Affichage du résultat de la conversion */}
            <Text style={styles.result}>
              {amount} {fromCurrency} - {convertCurrency()} {toCurrency}
            </Text>
            {/* Affichage du copyright */}
            <Text style={styles.copyright}>&copy;{year} Marshall Christ</Text>
          </>
        )}
      </View>

    </TouchableWithoutFeedback>

  )
}

// Styles CSS pour l'interface utilisateur
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dff0e6',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 150,
  },
  picker: {
    flex: 1,
    height: 50,
    marginHorizontal: 10,
  },
  result: {
    fontSize: 25,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#1d3627',
  },
  copyright: {
    fontSize: 15,
    marginTop: 100,
  },
  image: {
    width: 50,
    height: 50,
  }
})

export default CurrencyConverter // Export du composant CurrencyConverter par défaut
