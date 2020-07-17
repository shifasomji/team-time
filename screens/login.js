// home.js
import React, { useState } from 'react';
import 'react-native-gesture-handler';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage,Alert } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
// import Navigator from './navigation';
// import { NavigationContainer } from '@react-navigation/native';
// import NavigationContainer from './navigation';


/* login.js
 * Login screen
 * also contains firebase configs
 * 
 */

// firebase stuff

var firebaseConfig = {
  apiKey: "AIzaSyA2J1UBQxi63ZHx3-WN7C2pTOZRh1MJ3bI",
  authDomain: "social-alarm-2b903.firebaseapp.com",
  databaseURL: "https://social-alarm-2b903.firebaseio.com",
  projectId: "social-alarm-2b903",
  storageBucket: "social-alarm-2b903.appspot.com",
  /*messagingSenderId: "828360870887",
  appId: "1:828360870887:web:8d203554e5b469c1dd8b42",
  measurementId: "G-KXCXV485FZ"*/
};

firebase.initializeApp(firebaseConfig);

export default function Login({navigation})
{
  // states - contains info that user entered
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // signUpUser - called when user presses sign up button, 
  // navigates to sign up page
  signUpUser = () => {
    navigation.navigate('SignUp')

  };
  // loginUser - called when user presses login button
  // logs user in via firebase, navigates to App page (bottom tab navigator)
  // TODO: add AsyncStorage so user stays signed in
  loginUser = async (email, password) => {
    console.log('login');
    
    

    console.log({email});
    try {
      await AsyncStorage.setItem('userToken', email);
      firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
        
        navigation.navigate('App');
        console.log(user);
        }).catch(function(error) {
          Alert.alert('Oops!', error.toString().substring(6), [{text:'ok'}]);
        })
        
      } catch (error) {
      console.log(error.toString())
      //Alert.alert('Oops!', error.toString(), [{text:'ok'}]);
    }
    
  }

    if (!firebase.apps.length) {
      firebase.initializeApp({});
    }

    return (
      <View style={styles.container}>
        <Text style={styles.logo}>Group Alarm</Text>
        {/* text input fields (email, password) */}
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Email..."
            placeholderTextColor="#003f5c"
            onChangeText={(text) => {setEmail(text)}}/>
        </View>

        <View style={styles.inputView}>
          <TextInput
            secureTextEntry
            style={styles.inputText}
            placeholder="Password..."
            placeholderTextColor="#003f5c"
            onChangeText={(text) => setPassword(text)}/>
        </View>

        {/* forgot password button */}
        <TouchableOpacity onPress={ () => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* login button */}
        <TouchableOpacity style={styles.loginBtn}  onPress={ () => this.loginUser(email, password) } >
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        {/* signup button */}
        <TouchableOpacity  onPress={ () => this.signUpUser()} >
          <Text style={styles.loginText}>Signup</Text>
        </TouchableOpacity>

      </View>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo:{
    fontWeight:"bold",
    fontSize:50,
    color:"#fb5b5a",
    marginBottom:40
  },

  inputView:{
    width:"80%",
    backgroundColor:"#465881",
    borderRadius:25,
    height:50,
    marginBottom:20,
    justifyContent:"center",
    padding:20
  },

  inputText:{
    height:50,
    color:"white"
  },

  forgot:{
    color:"white",
    fontSize:13
  },

  loginText:{
    color:"white",
    fontSize:15
  },

  loginBtn:{
    width:"80%",
    backgroundColor:"#fb5b5a",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    marginBottom:10
  },

});