import React from 'react';
import { Switch, Text, View, StyleSheet } from 'react-native';

export default class App extends React.Component 
{
  state = { switchValue: false };

  toggleSwitch = value => {
    this.setState({ switchValue: value });
  };

  render() {
    return (
      <View style={styles.container}>
        {/*
        <Text>{this.state.switchValue ? 'Switch is ON' : 'Switch is OFF'}</Text>
        */}

        <Switch
          // style={{ marginTop: 30 }, color = "#000000"}
          style = {styles.Switch}
          onValueChange={this.toggleSwitch}
          value={this.state.switchValue}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  Switch: {
    marginTop: 0, 
    color: "#FFFFFF"
  }
});
