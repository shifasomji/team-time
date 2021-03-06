// signup.js
import React, { useState } from "react";
import "react-native-gesture-handler";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { db, auth } from "../../firebase/firebase";
import {
  APPBACKGROUNDCOLOR,
  APPTEXTRED,
  APPTEXTWHITE,
} from "../../style/constants";
import { appStyles } from "../../style/stylesheet";
import { NotificationContext } from "../../contexts/NotificationContext";

/* signup.js
 * SignUp screen
 *
 */

export default function SignUp({ navigation }) {
  // states - contains info that user entered
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // signUpUser - called when user presses sign up button
  // if passwords match, signs user up (and logs them in) and navigates to App
  signUpUser = async (email, password, confirmPassword, name) => {
    try {
      // if user enters same passwords
      if (password == confirmPassword) {
        // save login credentials in local storage
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("name", name);
        await AsyncStorage.setItem("password", password);

        // sign up user in firebase
        auth
          .createUserWithEmailAndPassword(email, password)
          .then(function (user) {
            // create a doc for user in firebase and initializes some things
            db.collection("users")
              .doc(email)
              .set({
                name: name,
                email: email,
                uid: user.user.uid,
                alarms: [],
                groups: [],
                notifications: [],
                birthday: "",
              })
              .then(navigation.navigate("App"))
              .catch(console.log("idk"));
          })
          .catch(function (error) {
            // if an error occurs - alert user
            Alert.alert("Oops!", error.toString(), [{ text: "OK" }]);
          });
      } else {
        // if passwords don't match alert user
        console.log("passwords dont match");
        Alert.alert("Oops!", "your passwords don't match", [{ text: "OK" }]);
      }
    } catch (error) {
      console.log(error.toString());
    }
  };

  return (
    <NotificationContext.Consumer>
      {(context) => {
        // context (theme) stuff
        const { isDarkMode, light, dark } = context;

        const theme = isDarkMode ? dark : light;

        return (
          // if user taps anywhere keyboard goes away
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View
              style={{
                ...styles.container,
                backgroundColor: theme.APPBACKGROUNDCOLOR,
              }}
            >
              {/* logo text */}
              <Text style={{ ...styles.logo, color: theme.APPTEXTRED }}>
                Sign Up
              </Text>

              {/* name text input */}
              <View
                style={{
                  ...appStyles.inputView,
                  backgroundColor: theme.APPINPUTVIEW,
                }}
              >
                <TextInput
                  style={appStyles.inputText}
                  placeholder="Name..."
                  placeholderTextColor="#003f5c"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setName(text);
                  }}
                />
              </View>

              {/* email text input */}
              <View
                style={{
                  ...appStyles.inputView,
                  backgroundColor: theme.APPINPUTVIEW,
                }}
              >
                <TextInput
                  style={appStyles.inputText}
                  placeholder="Email..."
                  placeholderTextColor="#003f5c"
                  keyboardType="email-address"
                  onChangeText={(text) => {
                    setEmail(text);
                  }}
                />
              </View>

              {/* password text input */}
              <View
                style={{
                  ...appStyles.inputView,
                  backgroundColor: theme.APPINPUTVIEW,
                }}
              >
                <TextInput
                  secureTextEntry
                  style={appStyles.inputText}
                  placeholder="Password..."
                  placeholderTextColor="#003f5c"
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                />
              </View>

              {/* confirm password text input */}
              <View
                style={{
                  ...appStyles.inputView,
                  backgroundColor: theme.APPINPUTVIEW,
                }}
              >
                <TextInput
                  secureTextEntry
                  style={appStyles.inputText}
                  placeholder="Confirm password..."
                  placeholderTextColor="#003f5c"
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                  }}
                />
              </View>
              {/* sign up button */}
              <TouchableOpacity
                style={{
                  ...appStyles.loginBtn,
                  backgroundColor: theme.APPTEXTRED,
                }}
                onPress={() =>
                  this.signUpUser(
                    email.trim(),
                    password,
                    confirmPassword,
                    name.trim()
                  )
                }
              >
                <Text
                  style={{ ...appStyles.loginText, color: theme.APPTEXTBLACK }}
                >
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        );
      }}
    </NotificationContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APPBACKGROUNDCOLOR,
    alignItems: "center",
    paddingTop: 20,
  },

  logo: {
    fontWeight: "bold",
    fontSize: 50,
    color: APPTEXTRED,
    marginBottom: 20,
    marginTop: 80,
  },
});
