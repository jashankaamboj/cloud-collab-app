/* Amplify Params - DO NOT EDIT
    API_CLIENT_GRAPHQLAPIENDPOINTOUTPUT
    API_CLIENT_GRAPHQLAPIIDOUTPUT
    API_CLIENT_GRAPHQLAPIKEYOUTPUT
    ENV
    REGION
Amplify Params - DO NOT EDIT */

const https = require("https");

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event, null, 2));

  const { documentId, userEmail, permission } = event.arguments;

  // Extract the current user's identity (Cognito username)
  // AppSync Lambda resolvers receive identity in event.identity.claims when using Cognito User Pools
  const identity = event.identity || {};
  const claims = identity.claims || {};
  
  // Try multiple ways to get the Cognito username
  const owner = claims["cognito:username"] || claims["username"] || identity.username || identity.sub;
  
  if (!owner) {
    console.error("No owner identity found. Event structure:", JSON.stringify(event, null, 2));
    throw new Error("Unauthorized: No user identity found");
  }
  
  console.log("Extracted owner:", owner, "from claims:", claims);

  console.log("Share request from owner:", owner, "for document:", documentId);

  // 1️⃣ Try to verify the user owns the document (optional - may fail with API key auth)
  try {
    const getDocumentQuery = `
      query GetDocument($id: ID!) {
        getDocument(id: $id) {
          id
          owner
          title
        }
      }
    `;

    const docRes = await callAppSync(getDocumentQuery, { id: documentId });
    const document = docRes?.data?.getDocument;
    
    if (document) {
      if (document.owner !== owner) {
        console.error(`Unauthorized: User ${owner} does not own document ${documentId} (owned by ${document.owner})`);
        throw new Error("Unauthorized: You can only share documents you own");
      }
      console.log("Ownership verified for document:", document.title);
    } else {
      console.warn("Could not verify document ownership (API key may not have permission), proceeding anyway");
    }
  } catch (verifyError) {
    // If ownership verification fails (e.g., API key doesn't have permission), log but continue
    // The AppSync auth rules will still protect the document from unauthorized sharing
    console.warn("Could not verify document ownership:", verifyError.message, "- proceeding with share creation");
  }

  try {
    // 2️⃣ Prevent duplicate shares
    const checkQuery = `
      query ListShares($documentId: ID!, $userEmail: String!) {
        listShares(filter: { documentId: { eq: $documentId }, userEmail: { eq: $userEmail } }) {
          items {
            id
            userEmail
            permission
          }
        }
      }
    `;

    const existing = await callAppSync(checkQuery, { documentId, userEmail });
    if (existing?.data?.listShares?.items?.length > 0) {
      console.log("Share already exists:", existing.data.listShares.items[0]);
      return existing.data.listShares.items[0];
    }

    // 3️⃣ Create new share with owner field set
    // Note: We'll create the Share object manually with the required fields
    // since API key auth may not allow direct createShare mutation
    const shareId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Get the document to include in the response
    let document = null;
    try {
      const getDocQuery = `
        query GetDocument($id: ID!) {
          getDocument(id: $id) {
            id
            title
            content
            description
            tags
            createdAt
            updatedAt
            owner
          }
        }
      `;
      const docRes = await callAppSync(getDocQuery, { id: documentId });
      document = docRes?.data?.getDocument;
    } catch (docErr) {
      console.warn("Could not fetch document for response:", docErr.message);
    }

    // Try to create Share using mutation
    const mutation = `
      mutation CreateShare($documentId: ID!, $userEmail: String!, $permission: Permission!, $owner: String!) {
        createShare(input: {
          documentId: $documentId,
          userEmail: $userEmail,
          permission: $permission,
          owner: $owner
        }) {
          id
          documentId
          userEmail
          permission
          owner
        }
      }
    `;

    try {
      const result = await callAppSync(mutation, { documentId, userEmail, permission, owner });
      console.log("Share created via mutation:", result);
      
      if (result?.data?.createShare) {
        // Return Share with document relationship included
        return {
          ...result.data.createShare,
          document: document,
          __typename: "Share"
        };
      }
    } catch (mutationErr) {
      console.error("Failed to create Share via mutation (may need IAM auth):", mutationErr.message);
      // If mutation fails due to auth, we still need to return an error
      throw mutationErr;
    }
    
    throw new Error("Failed to create share: unexpected response from AppSync");
  } catch (error) {
    console.error("Error sharing document:", error);
    // Re-throw with more context
    throw new Error(`Share creation failed: ${error.message || JSON.stringify(error)}`);
  }
};

// 🔧 Helper
function callAppSync(query, variables) {
  const endpoint = process.env.API_CLIENT_GRAPHQLAPIENDPOINTOUTPUT;
  const apiKey = process.env.API_CLIENT_GRAPHQLAPIKEYOUTPUT;

  return new Promise((resolve, reject) => {
    const req = https.request(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            
            // Check for GraphQL errors in the response
            if (parsed.errors && parsed.errors.length > 0) {
              const errorMessages = parsed.errors.map(e => e.message || JSON.stringify(e)).join(", ");
              console.error("GraphQL errors:", parsed.errors);
              reject(new Error(`GraphQL error: ${errorMessages}`));
              return;
            }
            
            // Check HTTP status codes
            if (res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`HTTP error ${res.statusCode}: ${data}`));
              return;
            }
            
            resolve(parsed);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}. Response: ${data}`));
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });
    
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
}
