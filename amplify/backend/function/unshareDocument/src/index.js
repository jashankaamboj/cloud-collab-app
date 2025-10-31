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

  const { documentId, userEmail } = event.arguments;

  // 1️⃣ Find the Share record
  const listQuery = `
    query ListShares($documentId: ID!, $userEmail: String!) {
      listShares(filter: { documentId: { eq: $documentId }, userEmail: { eq: $userEmail } }) {
        items {
          id
          documentId
          userEmail
        }
      }
    }
  `;

  try {
    const listResult = await callAppSync(listQuery, { documentId, userEmail });
    const share = listResult?.data?.listShares?.items?.[0];

    if (!share) {
      console.warn("⚠️ No share found for this document & user.");
      return null;
    }

    // 2️⃣ Delete the Share
    const deleteMutation = `
      mutation DeleteShare($id: ID!) {
        deleteShare(input: { id: $id }) {
          id
          documentId
          userEmail
        }
      }
    `;

    const deleteResult = await callAppSync(deleteMutation, { id: share.id });
    console.log("Unshared:", deleteResult);
    return deleteResult.data.deleteShare;
  } catch (error) {
    console.error("Error unsharing document:", error);
    throw error;
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
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
}
