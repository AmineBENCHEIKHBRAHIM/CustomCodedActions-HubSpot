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
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ['email','firstname','lastname','phone'])
    .then(results => {
      let email =results.body.properties.email;
    let phone = results.body.properties.phone;
      let firstname = results.body.properties.firstname;
      let lastname = results.body.properties.lastname;
    console.log(email);
    
    
    hubspotClient2.crm.contacts.basicApi.create(
      { 
                	"properties": 
                	{ 
                      "email": email, 
                      "phone": phone,
                      "firstname": firstname, 
                      "lastname": lastname
                	}
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

/* A sample event may look like:
{
  "origin": {
    // Your portal ID
    "portalId": 1,

    // Your custom action definition ID
    "actionDefinitionId": 2,
  },
  "object": {
    // The type of CRM object that is enrolled in the workflow
    "objectType": "CONTACT",

    // The ID of the CRM object that is enrolled in the workflow
    "objectId": 4,
  },
  // A unique ID for this execution
  "callbackId": "ap-123-456-7-8"
}
*/
