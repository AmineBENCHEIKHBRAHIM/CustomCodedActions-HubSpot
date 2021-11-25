// This Custom coded action can be used to trigger a Web Push notification for a specific contact on a web browser. 
// This example uses Firebase Cloud Messaging (FCM) which is a service offered by Google to let you relay server messages to registered devices and web apps. 
// Prerequisites: 
// - A firebase account has been created
// - A Firebase web project has been created and web app credentials were generated (for Web push example)
// - Firebase was Initialized (on your website) and Service Worker JS was created (essential for triggering notification when website is not loaded)
// - The contact (destinator of the push notification) has provided permission to get notifications and as a result, the device token was generated. 
// For this example, we assumed the device token was stored on a custom property called "Device Token" on HubSpot contact record. You may consider other alternatives like storing the token on your Website's Database or on HubDB. 


// Import Axios library for easier HTTP Requests making
const axios = require('axios')

exports.main = (event, callback) => {
  
 // Retrieving the Device Token value from the contact enrolled in the current workflow. This property should be specified in the "Property to include in code" section  above the code editor.
  
  const device_token = event.inputFields['device_token'];
  
  console.log(device_token);

  // Firebase Server Key should be stored as a Secret to be used in our Custom Coded Action. It can be found in the Firebase console. 
const headers = { 
    'Authorization': 'key='+process.env.FireBase_Server_Key,
    'Content-Type': 'application/json'
}
console.log(headers);
  // The request body includes the Device token of the contact and the data that will show on the notification itself
  const RequestBody = {
 "to" : device_token,
 "data" : {
     "body" : "Sending Notification Body From Data",
     "title": "Notification Title from Data"
 }
}
  
   axios.post('https://fcm.googleapis.com/fcm/send', RequestBody, { headers })
  .then(function (response) {
    console.log(response.body);
  })
  .catch(function (error) {
    console.log(error);
  });
}
