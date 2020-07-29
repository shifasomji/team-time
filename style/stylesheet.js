// Feel free to add to this style sheet so we can make the screens consistent throughout our app

import { StyleSheet } from "react-native";
import {
  APPBACKGROUNDCOLOR,
  APPTEXTRED,
  APPTEXTWHITE,
  APPINPUTVIEW,
} from "./constants";

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APPBACKGROUNDCOLOR,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 10,
  },

  loginContainer: {
    flex: 1,
    backgroundColor: APPBACKGROUNDCOLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontWeight: "bold",
    fontSize: 50,
    color: APPTEXTRED,
    marginBottom: 40,
  },

  inputView: {
    width: "80%",
    backgroundColor: APPINPUTVIEW,
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20,
  },

  inputText: {
    height: 50,
    color: APPTEXTWHITE,
  },

  forgot: {
    color: APPTEXTWHITE,
    fontSize: 13,
  },

  loginText: {
    color: APPTEXTWHITE,
    fontSize: 15,
  },

  loginBtn: {
    width: "80%",
    backgroundColor: APPTEXTRED,
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10,
  },

  modalToggle: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: APPTEXTRED,
    padding: 10,
    borderRadius: 10,

    color: APPTEXTRED,
  },

  modalContainer: {
    backgroundColor: APPBACKGROUNDCOLOR,
    flex: 1,
    alignItems: "center",
    padding: 15,
    paddingTop: 0,
  },

  modalClose: {
    alignSelf: "flex-end",
    marginTop: 50,
    marginBottom: 0,
  },

  buttonText: {
    color: APPTEXTWHITE,
    fontSize: 16,
    padding: 10,
  },
});


// ********** NEW STYLESHEET **********************************

const alarmStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APPBACKGROUNDCOLOR,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },

  scrollViewContainer: {
    flex: 1,
    backgroundColor: APPBACKGROUNDCOLOR,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
    paddingBottom: 10,
    padding: 0,
  },

  timerContainer: {
    flexDirection: "row",
  },

  topBanner: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: APPTEXTWHITE,
    // backgroundColor: APPBACKGROUNDCOLOR,
    height: 110,
    paddingTop: 30,
    paddingBottom: 0,
    padding: 15,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },

  Text: {
    height: 50,
    color: APPTEXTWHITE,
    fontSize: 16,
  },

  pageTitle: {
    padding: 20,
    color: APPTEXTRED,
    fontSize: 40,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  alarmTime: {
    color: APPTEXTWHITE,
    fontSize: 45,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },

  alarmText: {
    color: APPTEXTWHITE,
    fontSize: 16,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },

  alarmBanner: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: APPTEXTRED,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 0,
    paddingBottom: 0,
    width: "95%",
    borderRadius: 15,
  },

  alarmDetails: {
    flex: 1,
    backgroundColor: APPTEXTRED,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 15,
  },

  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonTitle: {
    color: APPTEXTWHITE,
    fontSize: 40,
  },

  buttonBorder: {
    color: APPTEXTWHITE,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  rowFront: {
    alignItems: "center",
    backgroundColor: "#CCC",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "center",
    height: 50,
  },

  backTextWhite: {
    color: "#FFF",
  },

  rowBack: {
    alignItems: "center",
    // backgroundColor: '#DDD',
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    width: "95%",
  },

  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: "blue",
    right: 75,
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  trash: {
    height: 25,
    width: 25,
  },
});

export { appStyles, alarmStyles };
