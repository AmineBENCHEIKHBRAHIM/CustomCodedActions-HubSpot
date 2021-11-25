/**
 * This custom coded action takes a new lead postal code as input. Then provides the ID of the Owner that should be assigned to that lead (an Account Executive for a sales lead for example).
 * The Territory management logic will be stored in a HubDB table inside of HubSpot, that for each postal code has a corresponding Email adress of the Owner to assign.
 * The Code will follow these steps:
 * - Taking Postal code as input
 * - Query The HubDB correspondance table to retrieve the Email address of the Account Executive responsible for that territory (postal code in here, but the logic can be extended to Postal code ranges)
 * - Find the HubSpot Owner ID (ID of HS User) corresponding to that Email address
 * - Store that value in an output field that can be copied to the lead Owner ID field in the next step using "Copy Property Value" action
 * As a result, the correct HubSpot User is assigned as owner of that lead.
 * This code is a good fit for larger organization having complex territory management logic in place that may result in a very complex and hard to maintain workflow if a workflow is used to manage that. 
 */

const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {
  
  // Instantiate HubSpot API Client
  
  const hubspotClient = new hubspot.Client({
    apiKey: process.env.HAPIKEY
  });
  
  // Store the postal code of the current contact enrolld in the workflow
  
  const postalcode = event.inputFields['zip'];
  console.log(postalcode);
  
  // If the postal code value is not indicated, through an error
  
if (postalcode != null && postalcode !='') {
            console.log(`Found a zip code. Assignment in progress`);
          } else {
            console.log('Contact doesn\'t have a zip code defined, no basis to assign a sales rep');
    throw new Error("Contact doesn't have a zip code");
          }
  
  // Get the Email address of the assigned Account Executive to that postal code by Quering the Correspondance HubDB table called "postalcodeassociations"
  
      hubspotClient
            .apiRequest({
              method: 'GET',
              path: `/cms/v3/hubdb/tables/postalcodesassociations/rows?postal_code=`+postalcode,
              body: {
              }
            })
            .then(SearchResult => {
        
        let SalesRepsEmails = SearchResult.body.results;
        if (SalesRepsEmails.length == 0) {
            console.log('No matching sales rep');
            throw new Error("No matching sales rep");
          } 
             
      let salesrepemail = SearchResult.body.results[0].values.sales_rep_email;
      console.log("sales rep email="+salesrepemail);
           
   // Get the ID of the HubSpot User having that Email Address
        
        hubspotClient.crm.owners.defaultApi.getPage(salesrepemail, undefined, 1, false).then(results3 => {
          if (results3.body.results.length == 0){
            console.log('No matching HubSpot user found');
            throw new Error("No matching HubSpot user found");
          }
         let ownerid = results3.body.results[0].id;

  console.log("Sales rep owner ID = "+ownerid);
        
      callback({
        outputFields: {
          owner_id: ownerid
        }
        
          })  
        
         });
      })
  .catch(err => {
      console.error(err);
      // We will automatically retry when the code fails because of a rate limiting error from the HubSpot API.
      throw err;
    });
}
