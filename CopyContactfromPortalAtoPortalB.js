const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {
  // Secrets can be accessed with environment variables.
  // Make sure to add your API key under "Secrets" above.
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY
  });
  
  const hubspotClient2 = new hubspot.Client({
    apiKey: process.env.TESTPORTALKEY
  });
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ['email','firstname','lastname','phone','hubspot_owner_id'])
    .then(results => {
      let email =results.body.properties.email;
    let phone = results.body.properties.phone;
      let firstname = results.body.properties.firstname;
      let lastname = results.body.properties.lastname;
    let hubspot_owner_id = results.body.properties.hubspot_owner_id;
    console.log(email);
    console.log(phone);
    console.log(firstname);
    console.log(lastname);
    console.log(hubspot_owner_id);
    

hubspotClient.crm.owners.defaultApi.getById(hubspot_owner_id, 'id', false).then(results2 => {
      let owneremail = results2.body.email;
  console.log("original owner ID = "+hubspot_owner_id); 
  console.log("owner Email = "+ owneremail);
      
       hubspotClient2.crm.owners.defaultApi.getPage(owneremail, undefined, 1, false).then(results3 => {
         let ownerid = results3.body.results[0].id;
       console.log("total = "+ results3.body.total);
         console.log(JSON.stringify(results3.body, null, 2));
  console.log("destination owner ID = "+ownerid);
       
       hubspotClient2.crm.contacts.basicApi.create(
      { 
                	"properties": 
                	{ 
                      "email": email, 
                      "phone": phone,
                      "firstname": firstname, 
                      "lastname": lastname,
                      "hubspot_owner_id": ownerid
                	}
                });
       
     
       });
      
      
      
    });
    
   
    
   
    
      // Use the callback function to return data that can be used in later actions.
      // Data won't be returned until after the event loop is empty, so any code after this will still execute.
      callback({outputFields: {}});
    })
    .catch(err => {
      console.error(err);
      // We will automatically retry when the code fails because of a rate limiting error from the HubSpot API.
      throw err;
    });
}
