import React ,{Component} from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import{Card,Header,Icon} from 'react-native-elements';
import firebase from 'firebase';

import db from '../config.js';

export default class RecieverDetailsScreen extends Component{
  constructor(props){
    super(props);
    this.state={
      userId          : firebase.auth().currentUser.email,
      userName        : "",
      recieverId      : this.props.navigation.getParam('details')["user_id"],
      requestId       : this.props.navigation.getParam('details')["request_id"],
      itemName        : this.props.navigation.getParam('details')["book_name"],
      item_description     : this.props.navigation.getParam('details')["reason_to_request"],
      recieverName    : '',
      recieverContact : '',
      recieverAddress : '',
      recieverRequestDocId : '',
      currencyCode : ''
    }
  }

  getRecieverDetails(){
    db.collection('users').where('email_id','==',this.state.recieverId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        this.setState({
          recieverName    : doc.data().first_name,
          recieverContact : doc.data().contact,
          recieverAddress : doc.data().address,
        })
      })
    });

    db.collection('requested_books').where('request_id','==',this.state.requestId).get()
    .then(snapshot=>{
      snapshot.forEach(doc => {
        this.setState({recieverRequestDocId:doc.id})
     })
  })}

  getUserDetails=(userId)=>{
    db.collection("users").where('email_id','==', userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        this.setState({
          userName  :doc.data().first_name + " " + doc.data().last_name
        })
      })
    })
  }

  getData(){
    fetch("http://data.fixer.io/api/latest?access_key=1f7dd48123a05ae588283b5e13fae944&format=1")
    .then(response=>{
      return response.json();
    }).then(responseData =>{
      var currencyCode = this.state.currencyCode
      var currency = responseData.rates.INR
      var value = 69/currency
      console.log(value);
    })
}

  updateItemStatus=()=>{
    db.collection('all_donations').add({
      "item_name"           : this.state.itemName,
      "request_id"          : this.state.requestId,
      "requested_by"        : this.state.recieverName,
      "donor_id"            : this.state.userId,
      "request_status"      :  "Donor Interested"
    })
  }

  addNotification=()=>{
    var message = this.state.userName + " has shown interest in exchanging the item"
    db.collection('all_notifications').add({
      "targeted_user_id"    : this.state.recieverId,
      "donor_id"            : this.state.userId,
      "request_id"          : this.state.requestId,
      "item_name"           : this.state.itemName,
      "date"                : firebase.firestore.FieldValue.serverTimestamp(),
      "notification_status" : "unread",
      "message"             : message
    })
  }

  componentDidMount(){
    this.getRecieverDetails()
    this.getUserDetails(this.state.userId)
  }

    render(){
      return(
        <View style={styles.container}>
          <View style={{flex:0.1}}>
            <Header
              leftComponent ={<Icon name='arrow-left' type='feather' color='#696969'  onPress={() => this.props.navigation.goBack()}/>}
              centerComponent={{ text:"Exchange Items", style: { color: '#90A5A9', fontSize:20,fontWeight:"bold", } }}
              backgroundColor = "#eaf8fe"
            />
          </View>
          <View style={{flex:0.3}}>
            <Card
                title={"Item Information"}
                titleStyle= {{fontSize : 20}}
              >
              <Card >
                <Text style={{fontWeight:'bold'}}>Name : {this.state.itemName}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Value:{this.state.currencyCode}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Description : {this.state.item_description}</Text>
              </Card>
            </Card>
          </View>
          <View style={{flex:0.3}}>
            <Card
              title={"Reciever Information"}
              titleStyle= {{fontSize : 20}}
              >
              <Card>
                <Text style={{fontWeight:'bold'}}>Name: {this.state.recieverName}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>CurrencyCode:{this.state.currencyCode}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Contact: {this.state.recieverContact}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Address: {this.state.recieverAddress}</Text>
              </Card>
            </Card>
          </View>
          <View style={styles.buttonContainer}>
            {
              this.state.recieverId !== this.state.userId
              ?(
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>{
                      this.updateItemStatus()
                      this.addNotification()
                      this.props.navigation.navigate('MyBarters')
                    }}>
                  <Text>Exchange</Text>
                </TouchableOpacity>
              )
              : null
            }
          </View>
        </View>
      )
    }

}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  buttonContainer : {
    flex:0.3,
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width:200,
    height:50,
    justifyContent:'center',
    alignItems : 'center',
    borderRadius: 10,
    backgroundColor: 'orange',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  }
})
