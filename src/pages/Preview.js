import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { getDocument } from "../graphql/queries";

function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const client = generateClient({ authMode: "userPool" });
        const response = await client.graphql({
          query: getDocument,
          variables: { id },
        });
        setDocument(response.data.getDocument);
      } catch (error) {
        console.error("Error loading document:", error);
        alert("❌ Failed to load document.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!document) return <p>❌ Document not found.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>{document.title || "Untitled Document"}</h2>
      <p>
        <em>{document.description || "No description"}</em>
      </p>
      <p>
        <strong>Tags:</strong>{" "}
        {document.tags && document.tags.length > 0
          ? document.tags.join(", ")
          : "None"}
      </p>

      <hr />

      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 5,
          background: "#fff",
          minHeight: 200,
        }}
        dangerouslySetInnerHTML={{
          __html: document.content || "<p>(No content)</p>",
        }}
      />

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ marginRight: 10 }}
        >
          Back to Dashboard
        </button>
        <button onClick={() => navigate(`/editor/${document.id}`)}>
          Edit Document
        </button>
      </div>
    </div>
  );
}

export default Preview;
