// This custom coded action can be used to maintain a contact sync between two HubSpot Portals (limited to contact properties).
// For example, If your business is collecting leads on a central portal (Portal A for this example) and you have different sales teams working each from their own HubSpot Portal for privacy reasons. 
// You can trigger this custom coded action each time a contact is created in the central portal to create a new contact in the target Sales team portal wiht its properties.
// What this code does as well, is that it assigns the correct Owner in the target portal as well. 
// This code can serve as inspiration for similar use cases like syncing companies, deals or tickets between multiple hubspot portals.
//For a video overview of the solution, you can check the following link.



const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {
  
  // Instantiate HubSpot Client that will be used to interface with Source Portal (Portal A)
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY
  });
  
  // Instantiate HubSpot Client that will be used to interface with Destination Portal (Portal B)
  const hubspotClient2 = new hubspot.Client({
    apiKey: process.env.TESTPORTALKEY
  });
  
  // Store the contact properties to sync in variables
  
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ['email','firstname','lastname','phone','hubspot_owner_id'])
    .then(results => {
      let email =results.body.properties.email;
    let phone = results.body.properties.phone;
      let firstname = results.body.properties.firstname;
      let lastname = results.body.properties.lastname;
    let hubspot_owner_id = results.body.properties.hubspot_owner_id;
    
   // Here we assume We would like to assign the same owner in Portal A to the copied contact in Portal B and that the owner is a user in both portal A and portal B. For example, if john.doe@hubspot.com is a user in Portal A and is the owner of the source contact. We would like to assign him as an owner of the destination contact in portal B. 
  
   // Get owner email in Portal A
hubspotClient.crm.owners.defaultApi.getById(hubspot_owner_id, 'id', false).then(results2 => {
      let owneremail = results2.body.email;
  console.log("original owner ID = "+hubspot_owner_id); 
  console.log("owner Email = "+ owneremail);
      
    // Get the owner ID corresponding to that email in portal B (Because a user even though with the same email, will have a different owner ID in each portal)
       hubspotClient2.crm.owners.defaultApi.getPage(owneremail, undefined, 1, false).then(results3 => {
         let ownerid = results3.body.results[0].id;
       console.log("total = "+ results3.body.total);
         console.log(JSON.stringify(results3.body, null, 2));
  console.log("destination owner ID = "+ownerid);
         
     // Create the contact in portal B and assign the owner to it
       
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
    
   
      callback({outputFields: {}});
    })
    .catch(err => {
      console.error(err);
      // We will automatically retry when the code fails because of a rate limiting error from the HubSpot API.
      throw err;
    });
}
