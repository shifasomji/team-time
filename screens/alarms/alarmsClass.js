// This is the most updated alarms page file as of 8/10/20

// Import statements
import React, { Component } from 'react';
import { StyleSheet, Button, View, Switch, Text, TextInput, Platform, TouchableOpacity, Modal, AsyncStorage, Animated, Image, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Chevron from '../../components/downChevron';

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { MaterialIcons } from "@expo/vector-icons";

import SwitchExample, {switchValue} from '../../components/toggleSwitch';

import {
  APPBACKGROUNDCOLOR,
  APPTEXTRED,
  APPTEXTWHITE,
  APPTEXTBLUE,
  APPINPUTVIEW,
  ALARMCOLORMINT,
  ALARMCOLORMAROON,
  ALARMCOLORPINK,
  ALARMCOLORDARKBLUE
} from "../../style/constants";
import { appStyles, alarmStyles } from "../../style/stylesheet";

import DatePicker from 'react-native-datepicker';
// import DatePicker from 'react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import Firebase from "../../firebase/firebase";

import { db, auth } from "../../firebase/firebase";
import { NotificationContext } from '../../contexts/NotificationContext';

const moment = require("moment");

// TopBanner formats the title and modal button along the top of the screen
function TopBanner({ children }){
  return(
    <View style = {alarmStyles.topBanner}>{children}</View>
  )
};

// An AlarmBanner is one alarm displayed in the list of alarms
function AlarmBanner({ children, color }){
  return(
      <View style={[alarmStyles.alarmBanner, {backgroundColor: color}]}>
        {children}
      </View>
  )
};

// AlarmDetails specifies the layout within an AlarmBanner 
function AlarmDetails({title, hour, minute}){
  
  var ampm;

  // For display purposes: A bit of logic to set am/pm, set hour 0 = 12, add 0 in front of mins that are <10
  if (hour < 12){
    ampm = " am";
  }
  if (hour > 12){
    hour = hour - 12;
    ampm = " pm";
  }
  if (hour == 12){
    ampm = " pm"
  }
  if (hour == 0){
    hour = "12";
    ampm = " am"
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  return (
      <View style={alarmStyles.alarmDetails}>
          <Text style={alarmStyles.alarmTime} adjustsFontSizeToFitnumberOfLines={1}>
          {/* <Text  adjustsFontSizeToFitnumberOfLines={1}> */}
            {hour}:{minute}{ampm}
          </Text>
          <Text style={alarmStyles.alarmText}>{title}</Text>
      </View>
  )
};

// Alarms is the main class
export default class Alarms extends Component {
    constructor(props) {
        super(props);
        this.AlarmsTable = this.AlarmsTable.bind(this); // This is the magical line that gets rid of "this" errors inside AlarmsTable
        // this.updateFirebaseAfterPlusGroup= this.updateFirebaseAfterPlusGroup.bind(this);
        // this.getFirebaseUsersAlarmsFromUsersDoc = this.getFirebaseUsersAlarmsFromUsersDoc.bind(this);
        // this.getFirebaseUsersAlarmsFromGroupsDocs = this.getFirebaseUsersAlarmsFromGroupsDocs.bind(this);
        this.addAlarm = this.addAlarm.bind(this);
        // this.editAlarmModal = this.editAlarmModal.bind(this);
        this.plusGroupButtonUpdate = this.plusGroupButtonUpdate.bind(this);
        this.editButtonUpdate = this.editButtonUpdate.bind(this);
        this.splitTime = this.splitTime.bind(this);
        
        // Defining state variables that are used throughout class functions
        this.state = {
            // alarms: [],
            alarms: [{alarm_hour: 0, alarm_minute: 0, color: null, key: " ", name: " ", switch: true}],

            // modal states
            newAlarmModalOpen: false,
            groupPickerModalOpen: false,
            editAlarmModalOpen: false,

            // for Expo push notifications 
            expoPushToken: "",
            notification: false,
            notificationListener: "",
            responseListener: "",

            // for adding a new alarm
            newAlarmTime: 0,
            newAlarmHour: 0,
            newAlarmMinute: 0,
            newAlarmText:"",
            
            newGroupName: "",
            groupsArray: [{label: "label", value: "value"}],
            groupIdClicked: "",
            singleAlarm: {alarm_hour: 0, alarm_minute: 0, color: null, key: " ", name: " ", switch: true},
            openRow: 0,
            currentMaxKey: 0,
            listOfKeys: [],
        }
    }

    // context (global state) stuff
    static contextType = NotificationContext;

    

    // Updates the local alarms array with user's unique alarms that are stored in the user's doc in Firebase
    getFirebaseUsersAlarmsFromUsersDoc(){
      db.collection("users")
      .doc(auth.currentUser.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          // Get the groups from the user's doc - store in some state to display
          const alarmsData = [];
          for (var i = 0; i < doc.data().alarms.length; i++) {
            alarmsData.push({
              alarm_hour: doc.data().alarms[i].alarm_hour,
              alarm_minute: doc.data().alarms[i].alarm_minute,
              key: doc.data().alarms[i].key,
              name: doc.data().alarms[i].name,
              switch: doc.data().alarms[i].switch,
              color: doc.data().alarms[i].color
            });
          }
          // Update the state with the alarms
          this.setState({ alarms: alarmsData });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }

    /*Updates the local alarms array with user's group alarms that are stored in all corresponding groups docs in Firebase*/
    getFirebaseUsersAlarmsFromGroupsDocs(){
      // Gets the list of groups that the user is in
      db.collection("users")
      .doc(auth.currentUser.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          // get the groups from the user's doc - store in some state to display
          const groupsData = [];
          for (var i = 0; i < doc.data().groups.length; i++) {
            groupsData.push({
              name: doc.data().groups[i].name,
              id: doc.data().groups[i].id,
              color: doc.data().groups[i].color,
              key: i,
              label: String(i),
              value: String(i)
            });
          }
          // Update the state with the user's groups
          this.setState({ groupsArray: groupsData });

          // Loops through all the documents corresponding to the user's groups and adds the alarms to state
          for (var i = 0; i < groupsData.length; i++){
            // gets the group color to add to the new alarm
            let groupAlarmColor = groupsData[i].color;

            db.collection("groups")
            .doc(groupsData[i].id)
            .get()
            .then((doc) => {
              if (doc.exists) {
                // get the alarms from the group's doc - store in some state to display
                const alarmsData = [];
                for (var j = 0; j < doc.data().alarms.length; j++) {
                  alarmsData.push({
                    alarm_hour: doc.data().alarms[j].alarm_hour,
                    alarm_minute: doc.data().alarms[j].alarm_minute,
                    key: doc.data().alarms[j].key,
                    name: doc.data().alarms[j].name,
                    switch: doc.data().alarms[j].switch,
                    color: groupAlarmColor
                  });
                }
                alarmList = this.state.alarms;
                Array.prototype.push.apply(alarmList, alarmsData);
              }
              // Update the state with the group alarms
              this.setState({ alarms: alarmList });
            })
            .catch(function (error) {
              console.log(error);
            });
          }
        }
      })
    }

    /*Uses the list of alarms to set the push notifications*/
    async makeAlarms(alarm_array){
      // console.log("makeAlarms")
      alarm_array.forEach(async(list_item) => {
          if (list_item.switch == true){
              promise = (await Notifications.scheduleNotificationAsync({
                  identifier: list_item.name,
                  content: {
                      title: list_item.name,
                      // Add feature: custom subtitle
                      // subtitle: 'Its ' + list_item.alarm_hour + ':' + list_item.alarm_minute + '!',
                  },
                  // DailyTriggerInput
                  trigger: {
                      hour: list_item.alarm_hour,
                      minute: list_item.alarm_minute,
                      repeats: false
                  }
              }));
          }
        });

      // list is the promise return
      list = (await Notifications.getAllScheduledNotificationsAsync());
      return list;
    };

    /*Cancels the specified alarm's push notification and removes the specified alarm from the alarm array*/
    async removeAlarm(identifier, alarm_array){ // identifier should be a string
      Notifications.cancelScheduledNotificationAsync(identifier)
      // console.log("cancelled", identifier)
  
      // Remove the alarm from the array
      for (var i = 0; i < alarm_array.length; i++) {
          if (alarm_array[i].name == identifier){
              alarm_array.splice(i, 1)
          }
      }

      this.setState({alarms: alarm_array})
    };

    
    /*Cancels all alarm push notification and empties the alarm array*/
    removeAllAlarms(){
      Notifications.cancelAllScheduledNotificationsAsync()
      // console.log("Cancelled All Scheduled Notifications Async")
      this.setState({ alarms: [{alarm_hour: 5, alarm_minute: 5, color: null, key: -1, name: ".", switch: true}] }); 
    };

    /*Adds an alarm to the alarm array, sets the alarm push notification, and updates the user's doc in Firebase*/
    async addAlarm(name, alarm_hour, alarm_minute, key, color, alarm_array) {

      promise = await (this.splitTime());
            
      // Add new alarm data to the local alarm_array to display
      alarm_array.push(
        {name: name, alarm_hour: alarm_hour, alarm_minute: alarm_minute, switch: true, key: key, color: color}
      )
      
      // Sort the alarm array by time after new alarm is added
      alarm_array.sort(this.sortByTime)
      
      // Use the new alarm data to schedule a notification
      promise = (await Notifications.scheduleNotificationAsync({
          identifier: name,
          content: {
              title: name,
              subtitle: 'Its ' + alarm_hour + ':' + alarm_minute + '!',
          },
          // DailyTriggerInput
          trigger: {
              hour: alarm_hour,
              minute: alarm_minute,
              repeats: false
          }
      }));

      // Update user's document in Firebase with the new alarm
      db.collection("users")
        .doc(auth.currentUser.email)
        .update({
          alarms: Firebase.firestore.FieldValue.arrayUnion({
            name: name, 
            alarm_hour: alarm_hour, 
            alarm_minute: alarm_minute, 
            switch: true, 
            key: key,
            color: color
          }),
      });

      // Increment the currentMaxKey now that we've added an alarm with key: currentMaxKey + 1
      await this.incrementCurrentMaxKey();
      
      // Return the list of all the scheduled notifications
      list = (await Notifications.getAllScheduledNotificationsAsync());
      return list;
    };

    /*For debugging: Prints all the scheduled push notifications to the console*/
    async showAlarms(){
      list = (await Notifications.getAllScheduledNotificationsAsync());
  
      if (list.length == 0) {
          console.log("list.length == 0")
      }
      else {
          var print_list_new
          for (var i = 0; i < list.length; i++) {
              print_list_new += "\n"
              print_list_new += list[i].identifier
          }
          console.log("showAlarms:", print_list_new)
          return list;
      }
    }

    /* Updates state with listOfKeys */
    listofKeys = () => new Promise(
      (resolve) => {
        var list = []
        for (var i = 0; i < this.state.alarms.length; i++) {
          list.push(this.state.alarms[i].key)
        }
        // Updates state
        this.setState( {listOfKeys: list})
        setTimeout(() => resolve(1234), 300)
      }
    )

    plusGroupButtonUpdate = async() => {
      console.log("Updating local, notifications, and Firebase after +Group button")

      promise = await(this.listofKeys());

      // Update Firebase (moves the alarm from user's doc to group's doc)
      promise = await(this.updateFirebaseAfterPlusGroup());

      // determine the color from the group
      for (var i = 0; i < this.state.groupsArray.length; i++){
        if (this.state.groupsArray[i].id == this.state.groupIdClicked){
          var groupAlarmColor = this.state.groupsArray[i].color
        }
      }

      // add new alarm to local state alarm array
      this.state.alarms.push(
        {name: this.state.singleAlarm.name, 
        alarm_hour: this.state.singleAlarm.alarm_hour, 
        alarm_minute: this.state.singleAlarm.alarm_minute, 
        switch: this.state.singleAlarm.switch,
        key: this.state.singleAlarm.switch,
        color: groupAlarmColor}
      )

      // remove old alarm from local state alarm array
      this.state.alarms.splice(this.state.openRow, 1)

      // Close the picker modal
      this.setState({ groupPickerModalOpen: false })
    }

    /*Updates the group's document in Firebase*/
    updateFirebaseAfterPlusGroup = () => new Promise (
      (resolve) => {
      console.log("Updating", this.state.groupIdClicked, "in Firebase")

      this.updateCurrentMaxKey();

      for (var i = 0; i < this.state.currentMaxKey + 1; i++) {
        if (this.state.listOfKeys.includes(i)){
          // console.log("this.state.listOfKeys.includes(i)")
          for (var j = 0; j < this.state.alarms.length; j++) {
            if (this.state.alarms[j].key == this.state.alarms[this.state.openRow].key){
              var newAlarm = {
                name: this.state.alarms[j].name, 
                alarm_hour: this.state.alarms[j].alarm_hour,
                alarm_minute: this.state.alarms[j].alarm_minute, 
                switch: this.state.alarms[j].switch, 
                key: this.state.alarms[j].key,
                color: this.state.alarms[j].color
              }
            }
          }
        }
      }

      // Add the alarm to group doc in Firebase
      db.collection("groups")
        .doc(this.state.groupIdClicked)
        .get()
        .then((doc) => {
          if (doc.exists) {
            var maxKey = 0
            for (var i = 0; i < doc.data().alarms.length; i++){
              var keySplitArray = doc.data().alarms[i].key.split(":")
              if (keySplitArray[1] > maxKey){
                maxKey = keySplitArray[1]
              }
            }
            maxKey = Number(maxKey) + 1
            db.collection("groups")
              .doc(this.state.groupIdClicked)
              .update({

                // When alarms get added to a groups file, they do not get a color
                // Their color is specified in the user's doc
                // This makes it easier to delete them from Firebase in deleteRow and edit functions
                alarms: Firebase.firestore.FieldValue.arrayUnion({
                  name: newAlarm.name, 
                  alarm_hour: newAlarm.alarm_hour,
                  alarm_minute: newAlarm.alarm_minute, 
                  switch: newAlarm.switch, 
                  key: this.state.groupIdClicked + ":" + (maxKey),
                  // color: newAlarm.color,
                }),
            })
          }
      });
      
      // Remove the alarm from the user's doc in Firebase (so the alarm is only listed in the group's doc)
      db.collection("users")
        .doc(auth.currentUser.email)
        .update({
          alarms: Firebase.firestore.FieldValue.arrayRemove({
            name: newAlarm.name, 
            alarm_hour: newAlarm.alarm_hour,
            alarm_minute: newAlarm.alarm_minute, 
            switch: newAlarm.switch, 
            key: newAlarm.key,
            color: newAlarm.color
          }),
      });

      // Update state
      this.setState( {singleAlarm: newAlarm} );

      setTimeout(() => resolve(1234), 300)
      }
    )

    /*Updates the correct document in Firebase after an alarm gets editted*/
    editButtonUpdate = async() => {

      promise = await (this.splitTime());

      console.log("Updating local, notifications, and Firebase after alarm edit button")

      // Update correct Firebase document where alarm data is stored 
      promise = await(this.updateFirebaseAfterEdit());

      // Remove the old alarm from the notification queue
      promise = (await Notifications.cancelScheduledNotificationAsync(this.state.alarms[this.state.openRow].name))

      // Use the new alarm data to schedule a notification
      promise = (await Notifications.scheduleNotificationAsync({
        // Notifications.scheduleNotificationAsync({
            identifier: this.state.newAlarmText,
            content: {
                title: this.state.newAlarmText,
                // subtitle: 'Its ' + alarm_hour + ':' + alarm_minute + '!',
            },
            // DailyTriggerInput
            trigger: {
                hour: this.state.newAlarmHour,
                minute: this.state.newAlarmMinute,
                repeats: false
            }
        }));

      // add new alarm to local state alarm array
      this.state.alarms.push(
        {name: this.state.newAlarmText, 
        alarm_hour: this.state.newAlarmHour, 
        alarm_minute: this.state.newAlarmMinute, 
        switch: this.state.alarms[this.state.openRow].switch,
        key: this.state.alarms[this.state.openRow].key,
        color: this.state.alarms[this.state.openRow].color}
      )

      // remove old alarm from local state alarm array
      this.state.alarms.splice(this.state.openRow, 1)
      
      // Sort the alarm array by time after new alarm is added
      this.state.alarms.sort(this.sortByTime)

      // Close the picker modal
      this.setState({ editAlarmModalOpen: false })
    }

    updateFirebaseAfterEdit = () => new Promise(
      (resolve) => {

        // if the key includes ":" then the alarm is a group alarm so we want to update the group doc
        if (String(this.state.alarms[this.state.openRow].key).includes(":")){ 
        console.log("Edit button: Group alarm so updating group doc")

        // get the group that the alarm is part of (first part of key before ":")
        var keySplitArray = this.state.alarms[this.state.openRow].key.split(":")

        db.collection("groups")
        .doc(keySplitArray[0])
        .get()
        .then((doc) => {
          if (doc.exists) {
            db.collection("groups")
              .doc(keySplitArray[0])
              .update({
                alarms: Firebase.firestore.FieldValue.arrayRemove({
                  name: this.state.alarms[this.state.openRow].name,
                  alarm_hour: this.state.alarms[this.state.openRow].alarm_hour,
                  alarm_minute: this.state.alarms[this.state.openRow].alarm_minute, 
                  switch: this.state.alarms[this.state.openRow].switch, 
                  key: this.state.alarms[this.state.openRow].key,
                  color: this.state.alarms[this.state.openRow].color, 
                }),
              })
          }
        });

        db.collection("groups")
        .doc(keySplitArray[0])
        .get()
        .then((doc) => {
          if (doc.exists) {
            db.collection("groups")
              .doc(keySplitArray[0])
              .update({
                alarms: Firebase.firestore.FieldValue.arrayUnion({
                  name: this.state.newAlarmText, 
                  alarm_hour: this.state.newAlarmHour, 
                  alarm_minute: this.state.newAlarmMinute,
                  switch: this.state.alarms[this.state.openRow].switch,
                  key: keySplitArray[0] + ":" + keySplitArray[1],
                  color: this.state.alarms[this.state.openRow].color, 
                }),
              })
          }
        });

      }
      // if the key doesn't include ":" then the alarm is a personal alarm so we want to update the user doc
      else{ 
        console.log("Edit button: Personal alarm so updating user doc")

        db.collection("users")
          .doc(auth.currentUser.email)
          .get()
          .then((doc) => {
            if (doc.exists) {
              db.collection("users")
                .doc(auth.currentUser.email)
                .update({
                  alarms: Firebase.firestore.FieldValue.arrayRemove({
                    name: this.state.alarms[this.state.openRow].name,
                    alarm_hour: this.state.alarms[this.state.openRow].alarm_hour,
                    alarm_minute: this.state.alarms[this.state.openRow].alarm_minute, 
                    switch: this.state.alarms[this.state.openRow].switch, 
                    key: this.state.alarms[this.state.openRow].key,
                    color: this.state.alarms[this.state.openRow].color, 
                  }),
                })
            }
          });

        db.collection("users")
          .doc(auth.currentUser.email)
          .get()
          .then((doc) => {
            if (doc.exists) {
              db.collection("users")
                .doc(auth.currentUser.email)
                .update({
                  alarms: Firebase.firestore.FieldValue.arrayUnion({
                    name: this.state.newAlarmText, 
                    alarm_hour: this.state.newAlarmHour, 
                    alarm_minute: this.state.newAlarmMinute,
                    switch: this.state.alarms[this.state.openRow].switch, 
                    key: this.state.alarms[this.state.openRow].key,
                    color: this.state.alarms[this.state.openRow].color, 
                  }),
                })
            }
          });
      }
      setTimeout(() => resolve(1234), 300)
      }
    )

    /*Updates state with the user's groups*/
    getFirebaseUsersGroups() {
      db.collection("users")
      .doc(auth.currentUser.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          // get the groups from the user's doc - store in some state to display
          const groupsData = [];
          for (var i = 0; i < doc.data().groups.length; i++) {
            groupsData.push({
              name: doc.data().groups[i].name,
              id: doc.data().groups[i].id,
              color: doc.data().groups[i].color,
              key: i,
            });
          }

          // Adds label and value keys to the groupsArray for the picker to work
          groupsData.forEach( element => {
            element.label = element.name;
            element.value = element.id;
            element.key = element.id;
          })

          // Update state
          this.setState({ groupsArray: groupsData });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }

    /*Splits the time string from the time picker into hour and minute and updates state*/
    splitTime = () => new Promise(
      (resolve) => {
      var variable = this.state.newAlarmTime
      var splitArray
      splitArray = variable.split(":") // splits the string at the ":" character
      this.setState( {newAlarmHour: Number(splitArray[0]) })
      this.setState( {newAlarmMinute: Number(splitArray[1]) })
      setTimeout(() => resolve(1234), 300)
    }
  )

    /*Displays all the alarm banners*/
    AlarmsTable(props){

      // Closes row
      const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
      };
  
      // Deletes alarm corresponding to touched row from local array and from Firebase
      const deleteRow = (rowMap, rowKey) => {
        closeRow(rowMap, rowKey);
        const newData = [...props.alarms];
        const prevIndex = props.alarms.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        this.setState({ alarms: newData });

        // If the alarm is a personal alarm (key does not contain a ":"), then remove the alarm from the groups's doc in Firebase
        if (String(props.alarms[prevIndex].key).includes(":") == false){
        // Remove the alarm from the user's doc in Firebase
        db.collection("users")
          .doc(auth.currentUser.email)
          .update({
            alarms: Firebase.firestore.FieldValue.arrayRemove({
              name: props.alarms[prevIndex].name,
              alarm_hour: props.alarms[prevIndex].alarm_hour,
              alarm_minute: props.alarms[prevIndex].alarm_minute, 
              switch: props.alarms[prevIndex].switch, 
              key: props.alarms[prevIndex].key,
            }),
          });
        }

        // If the alarm is a group alarm (key contains a ":"), then remove the alarm from the groups's doc in Firebase
        if (String(props.alarms[prevIndex].key).includes(":")){
          var groupIDSplitArray = props.alarms[prevIndex].key.split(":")
          db.collection("groups")
            .doc(groupIDSplitArray[0])
            .update({
              // Alarms in groups files do not have color
              alarms: Firebase.firestore.FieldValue.arrayRemove({
                name: props.alarms[prevIndex].name,
                alarm_hour: props.alarms[prevIndex].alarm_hour,
                alarm_minute: props.alarms[prevIndex].alarm_minute, 
                switch: props.alarms[prevIndex].switch, 
                key: props.alarms[prevIndex].key,
              }),
            });
          
          // Cancel the specified alarm's push notification and remove the alarm from the local array
          this.removeAlarm(props.alarms[prevIndex].name, props.alarms);
        };
      }
  
      // Updates state with which row(alarm) was pressed and opened
      onRowDidOpen = (rowKey) => {
        const prevIndex = props.alarms.findIndex(item => item.key === rowKey);
        this.setState({ openRow: Number(prevIndex)});
      };
  
      const onSwipeValueChange = swipeData => {
        const { key, value } = swipeData;
      };
  
      // Renders the buttons behind the alarm banners
      const renderHiddenItem = (data, rowMap) => (
        <View style={alarmStyles.rowBack}>

            {/*+Group button */}
            <TouchableOpacity
                style={[alarmStyles.backLeftBtn]}
                onPress={() => 
                  this.setState( {groupPickerModalOpen: true} )}
            >
              <Text style={alarmStyles.backTextWhite}>+Group</Text>
            </TouchableOpacity>

            {/* Edit button */}
            <TouchableOpacity
                style={[alarmStyles.backRightBtn, alarmStyles.backRightBtnCenter]}
                onPress={() => 
                  this.setState( {editAlarmModalOpen: true} )}
            >
              <Text style={alarmStyles.backTextWhite}>Edit</Text>
            </TouchableOpacity>
  
            {/*Trash button */}
            <TouchableOpacity
                style={[alarmStyles.backRightBtn, alarmStyles.backRightBtnRight]}
                onPress={() => deleteRow(rowMap, data.item.key)}
            >
              <View style={[alarmStyles.trash]}>
                  <Image
                      source={require('../../assets/trash.png')}
                      style={alarmStyles.trash}
                  />
              </View>
            </TouchableOpacity>
        </View>
      );

      return(
        <View>
          {/* Renders the alarm banners as swipable components */}
          <SwipeListView
            // These are all specified by SwipeListView
            keyExtractor ={(item) => String(item.key)} // specifying id as the key to prevent the key warning
            data = {props.alarms}
            renderItem={({ item }) => (
              // Uncommenting TouchableHighlight code below would enable edit alarm modal to open when the alarm banner is pressed. 
              // As of rn though, TouchableHighlight press to open edit alarm modal doesn't update state so wrong alarm data is displayed in edit modal... 
              // The code is currently implementing the edit feature using swipe and click edit button because I didn't want to create 
              // a use conflict between clicking the alarm banner to edit and pressing the switch. 

              // <TouchableHighlight 
              // onPress={() => 
              //   this.setState( {editAlarmModalOpen: true} )}
              // >
              <View>
                <AlarmBanner color={item.color}>
                    <AlarmDetails title={item.name} hour={item.alarm_hour} minute={item.alarm_minute}/>
                    <SwitchExample/>
                </AlarmBanner>
              </View>
              // </TouchableHighlight>
            )}
            renderHiddenItem={renderHiddenItem}
            leftOpenValue={85}
            rightOpenValue={-145}
            previewRowKey={"1"}
            previewOpenValue={85}
            previewOpenDelay={500}
            onRowDidOpen={onRowDidOpen}
            onSwipeValueChange={onSwipeValueChange}
        />
        </View>
      )
    };

    // Sorts the alarms for output in ascending order by time
    sortByTime(a, b) {
      const Ah = a.alarm_hour;
      const Bh = b.alarm_hour;
  
      const Am = a.alarm_minute;
      const Bm = b.alarm_minute;
  
      let comparison = 0;
      if (Ah > Bh) {
        comparison = 2;
      } 
      else if (Ah < Bh) {
        comparison = -2;
      } 
      else if (Ah == Bh) {
        if (Am > Bm) {
          comparison = 1;
        } else if (Am < Bm){
          comparison = -1;
        }
      }
      return comparison;
    };

    /*Sets up push notifications permissions*/
    async registerForPushNotificationsAsync() {
      let token;
      if (Constants.isDevice) {
          // Check for existing permissions
          const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
          // console.log("existingStatus:", existingStatus);
          let finalStatus = existingStatus;

          // If no existing permissions, ask user for permission
          if (existingStatus !== 'granted') {
          const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
          finalStatus = status;
          }

          // If no permission, exit the function
          if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
          }

          // Get push notification token
          token = (await Notifications.getExpoPushTokenAsync()).data;
          // console.log("token:", token);
      } 
      else {
          alert('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          });
      }
      return token;
    }

    /*Returns a promise when initialization functions having to do with Firebase and state have run*/
    getFirebase = () => new Promise(
      (resolve) => {
        // get the user's personal alarms
        this.getFirebaseUsersAlarmsFromUsersDoc();

        // get the user's group alarms
        this.getFirebaseUsersAlarmsFromGroupsDocs();

        // get the users groups
        this.getFirebaseUsersGroups();

        this.updateCurrentMaxKey();

        setTimeout(() => resolve(1234), 3000)
      }
    )

    /*Updates the currentMaxKey state*/
    updateCurrentMaxKey(){
      var maxKey = this.state.currentMaxKey

      db.collection("users")
      .doc(auth.currentUser.email)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.collection("users")
            .doc(auth.currentUser.email)
            for (var i = 0; i < doc.data().alarms.length; i++){
              if (doc.data().alarms[i].key > maxKey){
                maxKey = doc.data().alarms[i].key
              }
            }
        }
        // Update state
        this.setState({currentMaxKey: maxKey});
      })
    }

    /*Returns a promise when the currentMaxKey is incremented by 1*/
    incrementCurrentMaxKey = () => new Promise(
      (resolve) => {
        newMaxKey = this.state.currentMaxKey;
        newMaxKey = newMaxKey + 1; 
        this.setState({currentMaxKey: newMaxKey})
        setTimeout(() => resolve(1234), 1000)
      }
    )

    /*Runs when page refreshes: Initialization*/
    componentDidMount(){
      this.isComponentMounted = true;
      // console.log("componentDidMount, this.isComponentMounted:", this.isComponentMounted)
      this.componentDidMountHelper();
    }

    /*Async function called by componentDidMount */
    componentDidMountHelper = async () => {
        if(this.isComponentMounted){
        // console.log("componentDidMountHelper, this.isComponentMounted:", this.isComponentMounted)

        // Removes all alarms
        this.removeAllAlarms();

        // Waits for Firebase related initialization functions to run
        const promise = await this.getFirebase();

        // Uses alarms array to make the alarms
        this.makeAlarms(this.state.alarms);

        // Sorts the alarms for output in ascending order by time
        this.state.alarms.sort(this.sortByTime)

        // Registers for push notifications and sets the user's Expo push notification token
        this.registerForPushNotificationsAsync().then(token => this.setState({ expoPushToken: token }))//.catch(console.log(".catch"))

        // let the_subscription;
        this.state.notificationListener = Notifications.addNotificationReceivedListener(notification => this.setState({ notification: notification}))
        // this.state.responseListener = Notifications.addNotificationResponseReceivedListener(response => {console.log("Response:", response)});
      
        return () => {
          Notifications.removeNotificationSubscription(this.state.notificationListener);
          Notifications.removeNotificationSubscription(this.state.responseListener);
        };
      }
      else{
        console.log("this.isComponentMounted == false in componentDidMountHelper")
        return;
      }
    };

    componentWillUnmount(){
      // console.log("componentWillUnmount")
      this.isComponentMounted = false;
    }

    /* MODAL FOR EDIT ALARM */
    editAlarmModal(){
        return(
        <Modal visible={this.state.editAlarmModalOpen} animationType="slide">
        <View style={appStyles.modalContainer}>
            <MaterialIcons
            name="close"
            size={24}
            style={{ ...appStyles.modalToggle, ...appStyles.modalClose }}
            onPress={() => this.setState({ editAlarmModalOpen: false })}
            />
            <Text style={alarmStyles.modalTitle}> Edit Alarm </Text>

            <View style = {{...alarmStyles.rowStyle}}>
              <MaterialIcons
                name="access-time"
                size={55}
                style={{...appStyles.modalToggle, color: APPTEXTRED, height: -60}} // fix color so that it's theme.APPTEXTRED
              />
              <DatePicker
                style={{height: 40, width: 200}}
                date= {String((this.state.alarms[this.state.openRow].alarm_hour) + ":" + (this.state.alarms[this.state.openRow].alarm_minute))} // Starts timepicker at current alarm time
                mode="time"
                format="HH:mm"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                showIcon={false}
                minuteInterval={1}
                onDateChange={(time) => this.setState({ newAlarmTime: time })}
                customStyles={{
                  // fix these so that the colors are theme._____
                  datePicker: {backgroundColor: '#A9A9A9'},
                  dateInput: {borderColor: APPBACKGROUNDCOLOR, borderRadius: 25, height: 60},
                  dateText: {fontSize: 50, color: APPTEXTRED, fontWeight: "normal"},
                  placeholderText: {color: APPTEXTRED}
                }}
              />
            </View>

            <View style={appStyles.inputView}>
              <TextInput
                style={appStyles.inputText}
                placeholder={this.state.alarms[this.state.openRow].name}
                placeholderTextColor="#003f5c"
                onChangeText={(text) => this.setState({newAlarmText: text})}
              />
            </View>

            <Button
              title="Update Alarm"
              color="lightgreen"
              onPress={ async() =>
                this.editButtonUpdate()
              }
            />

            </View>
        </Modal>
        );
    }
    
    render(){
      // context  (global state) stuff
      const { isDarkMode, light, dark } = this.context
      const theme =  isDarkMode ? dark : light; 

      // TopBanner formats the title and modal button along the top of the screen
      function TopBanner({ children }){
        return(
          <View style = {{...alarmStyles.topBanner, backgroundColor: theme.APPBACKGROUNDCOLOR}}>{children}</View>
        )
      };
      return(
        <View style={{...appStyles.container, backgroundColor: theme.APPBACKGROUNDCOLOR}}>
          <TopBanner>
              <Text style={{...alarmStyles.pageTitle, color: theme.APPTEXTRED}}>Alarms</Text>
        
              {/*BEGINNING OF MODAL FOR ADD ALARM */}
              <MaterialIcons
                  name="alarm-add"
                  size={36}
                  style={{...appStyles.modalToggle, color: theme.APPTEXTRED}}
                  onPress={() => this.setState({ newAlarmModalOpen: true })}
              />
              <Modal visible={this.state.newAlarmModalOpen} animationType="slide">
                {/* this allows for dismiss keyboard when tapping anywhere functionality */}
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                  <View style={{...appStyles.modalContainer, backgroundColor: theme.APPBACKGROUNDCOLOR}}>
                      <MaterialIcons
                      name="close"
                      size={24}
                      style={{ ...appStyles.modalToggle, ...appStyles.modalClose, color: theme.APPTEXTRED }}
                      onPress={() => this.setState({ newAlarmModalOpen: false })}
                      />

                      <Text style={{...alarmStyles.modalTitle, color: theme.APPTEXTRED}}> Add Alarm </Text>

                      <View style = {{...alarmStyles.rowStyle}}>
                        <MaterialIcons
                          name="access-time"
                          size={55}
                          style={{...appStyles.modalToggle, color: theme.APPTEXTRED, height: -60}}
                        />
                        <DatePicker
                          style={{height: 40, width: 200}}
                          date= {moment().format("LTS")} // Starts timepicker at current time (except always AM?)
                          mode="time"
                          placeholder="select date"
                          format="HH:mm"
                          confirmBtnText="Confirm"
                          cancelBtnText="Cancel"
                          showIcon={false}
                          minuteInterval={1}
                          onDateChange={(time) => this.setState({ newAlarmTime: time })}
                          customStyles={{
                            datePicker: {backgroundColor: '#A9A9A9'},
                            dateInput: {borderColor: theme.APPBACKGROUNDCOLOR, borderRadius: 25, height: 60},
                            dateText: {fontSize: 50, color: theme.APPTEXTRED, fontWeight: "normal"},
                            placeholderText: {color: theme.APPTEXTRED}
                          }}
                        />
                      </View>

                      <View style={appStyles.inputView}>
                        
                        <TextInput
                          style={appStyles.inputText}
                          placeholder="Alarm title..."
                          placeholderTextColor={APPTEXTBLUE}
                          onChangeText={(text) => this.setState({newAlarmText: text})}
                        />
                      </View>

                      {/* Add alarm button */}
                      <TouchableOpacity
                        style={{...appStyles.loginBtn, backgroundColor: theme.APPTEXTRED}}
                        // title="Set Alarm"
                        onPress={ async() =>
                          this.addAlarm(this.state.newAlarmText, this.state.newAlarmHour, this.state.newAlarmMinute, this.state.currentMaxKey + 1, "#fb5b5a", this.state.alarms)
                          .then(this.setState({ newAlarmModalOpen: false }))
                        }
                        >
                        <Text style={appStyles.buttonText}> Add alarm </Text>
                      </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
              {/*END OF MODAL FOR ADD ALARM */}

          </TopBanner>
        
          <View style={{...alarmStyles.scrollViewContainer, backgroundColor: theme.APPBACKGROUNDCOLOR}}>
              {/* Useful print statements on screen for debugging */}
              {/* <Text>Your expo push token: {expoPushToken}</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text>Title: {notification && notification.request.content.title} </Text>
              <Text>Body: {notification && notification.request.content.body}</Text>
              <Text>Data: {notification && JSON.stringify(notification.request.content.data.body)}</Text>
              </View> */}

            <this.AlarmsTable alarms={this.state.alarms}/>

          </View>

          {/* Useful button during testing */}

          {/* <Button
            title="Print user email to console"
            onPress={ async() =>
              console.log("auth.currentUser.email:", auth.currentUser.email)
            }
          /> */}

          {/* BEGINNING OF MODAL FOR GROUP PICKER */}
          <Modal visible={this.state.groupPickerModalOpen} animationType="slide">
          <View style={{...appStyles.modalContainer, backgroundColor: theme.APPBACKGROUNDCOLOR}}>
              <MaterialIcons
              name="close"
              size={24}
              style={{ ...appStyles.modalToggle, ...appStyles.modalClose, color:  theme.APPTEXTRED }}
              onPress={() => this.setState({ groupPickerModalOpen: false })}
              />

              <Text style={{...alarmStyles.modalTitle, color: theme.APPTEXTRED}}> Select a group </Text>

              {/* https://github.com/lawnstarter/react-native-picker-select */} 
              <RNPickerSelect
                onValueChange={(value) => this.setState({ groupIdClicked: value })}
                items={this.state.groupsArray}

                // Object to overide the default text placeholder for the PickerSelect
                placeholder={{label: "Click here to select a group", value: "0"}}
                style={
                  { fontWeight: 'normal',
                    color: 'red',
                    placeholder: {
                      color: theme.APPTEXTRED,
                      fontSize: 20,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    inputIOS: {
                      color: theme.APPTEXTBLUE,
                      fontSize: 20,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  }
                }
                doneText={"Select"}
                Icon={() => {return <Chevron size={1.5} color="gray" />;}}
              />

              {/*
              <Text></Text>

              <TouchableOpacity
                style={{ ...appStyles.loginBtn, marginTop: 10, backgroundColor: theme.APPTEXTRED }}
                onPress={async() =>
                  this.updateFirebaseGroupsDoc()
                  
                */}

                
              <Button
                title="Add alarm to group"
                color="lightgreen"
                onPress={ async() =>
                  this.plusGroupButtonUpdate()

                }
              />

              </View>
          </Modal>
          {/* END OF MODAL FOR GROUP PICKER */}


          {/* BEGINNING OF EDIT ALARM MODAL */}
          <Modal visible={this.state.editAlarmModalOpen} animationType="slide">
          <View style={{...appStyles.modalContainer, backgroundColor: theme.APPBACKGROUNDCOLOR}}>
            <MaterialIcons
            name="close"
            size={24}
            style={{ ...appStyles.modalToggle, ...appStyles.modalClose, color: theme.APPTEXTRED }}
            onPress={() => this.setState({ editAlarmModalOpen: false })}
            />
            <Text style={{...alarmStyles.modalTitle, color: theme.APPTEXTRED}}> Edit Alarm </Text>

            <DatePicker
              style={{height: 75, width: 200}}
              date= {String((this.state.alarms[this.state.openRow].alarm_hour) + ":" + (this.state.alarms[this.state.openRow].alarm_minute))} // Starts timepicker at current alarm time
              mode="time"
              format="HH:mm"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              showIcon={false}
              minuteInterval={1}
              onDateChange={(time) => this.setState({ newAlarmTime: time })}
              customStyles={{
                datePicker:{backgroundColor: '#A9A9A9'}
              }}
            />

            <View style={appStyles.inputView}>
              <TextInput
                style={appStyles.inputText}
                placeholder={this.state.alarms[this.state.openRow].name}
                placeholderTextColor="#003f5c"
                onChangeText={(text) => this.setState({newAlarmText: text})}
              />
            </View>

            <Button
              title="Split the time"
              onPress={ async() =>
                this.splitTime()
              }
            />

            <Button
              title="Update Alarm"
              color="lightgreen"
              onPress={ async() =>
                this.editButtonUpdate()
              }
            />

            </View>
        </Modal>
          {/* END OF EDIT ALARM MODAL */}

        </View>
      );
    };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
  }),
});

// Styles com from global stylesheet.js
