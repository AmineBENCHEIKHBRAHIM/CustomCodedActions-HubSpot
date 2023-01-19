const axios = require('axios')
const emailtemplateid=98981864298;

/***
What this code does: 
1/ Get all associated contacts to current company
2/ For each associated contact, send him an email using the email template specified while passing over the correct company name

***/

exports.main = async (event, callback) => {

  const companyname = event.inputFields['name'];
  console.log("enrolled company name in this workflow is = "+companyname);
  const companyid = event.inputFields['companyid'];
  console.log("enrolled company id in this workflow is = "+companyid);
  
var data2 = '';

var config = {
  method: 'get',
  url: 'https://api.hubapi.com/crm/v4/objects/companies/'+companyid+'/associations/contacts',
  headers: { 
    'Authorization': 'Bearer ' +process.env.accesstoken
  },
  data : data2
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
  
  if (response.data.results.length == 0) {
        console.log("Company doesn't have any associated contacts");
        return;
  } 
 console.log("Number of associated contacts to this company is = "+response.data.results.length);
  
  for (let i = 0; i < response.data.results.length; i++) {
  console.log("contact "+i+" = "+response.data.results[i].toObjectId);
    
    let contactid = response.data.results[i].toObjectId;
    
    var config2 = {
  method: 'get',
  url: 'https://api.hubapi.com/crm/v3/objects/contacts/'+contactid,
  headers: { 
    'Authorization': 'Bearer ' +process.env.accesstoken
  }   
      
};

axios(config2)
.then(function (response2) {
  console.log(JSON.stringify(response2.data));
  let contactemail = response2.data.properties.email;
 console.log(`The company's associated contact Email is ${contactemail}`); 
  
  
  
  
  
        console.log ("checking parameters "+contactemail+" "+companyname);
      
      const requestBody = {
    "emailId": emailtemplateid,
    "message": {
        "to": contactemail
    },
    "customProperties": [
        {
            "name": "companyname",
            "value": companyname
        }
    ]
}
      
        const headers = {
    'Authorization': 'Bearer ' +process.env.accesstoken,
    'Content-Type': 'application/json'
  };
      
      axios
    .post(     'https://api.hubapi.com/email/public/v1/singleEmail/send',
      requestBody,
      { headers }
    )
    .then(response3 => {
      console.log(`Response from Email send: ${response3.body}`);
    });
  

  
})
.catch(function (error) {
  console.log(error);
});
    
    
}
  
})
.catch(function (error) {
  console.log(error);
});
  

  callback({
    outputFields: {
      name: companyname
    }
  });
  };
