// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { useNavigate } from "react-router-dom";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Client will be created per-request with auth context

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filterTag, setFilterTag] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // -----------------------------
  // Load user info & documents
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const current = await getCurrentUser();
        let attrs = await fetchUserAttributes();

        // fetchUserAttributes may return either a map or an array depending on
        // Amplify version/config. Normalize to a map: { email, name, "cognito:username" }
        if (Array.isArray(attrs)) {
          const map = {};
          attrs.forEach((a) => {
            // Support both { Name, Value } and { name, value }
            const key = a.Name || a.name;
            const val = a.Value || a.value;
            if (key) map[key] = val;
          });
          attrs = map;
        }

        // ✅ Use the real Cognito username (what Amplify uses as "owner")
        // In Amplify v6, username is directly available from getCurrentUser
        const owner = current?.username || attrs["cognito:username"] || attrs["sub"] || "";
        const email = attrs?.email || "";
        const displayName = attrs?.name || email || owner;

        // Debug: print resolved identity info to the console so we can see
        // whether owner/email are present when fetching documents.
        console.debug("Dashboard:init - current user:", { current, attrs, owner, email });

        setUserEmail(email);
        setUserName(displayName);

        await fetchDocuments(owner, email);
      } catch (err) {
        console.error("⚠️ Failed to load user info:", err);
        toast.error("Failed to load user details. Please re-login.");
      }
    };
    init();
  }, []);

  // -----------------------------
  // Fetch owned + shared documents
  // -----------------------------
  const fetchDocuments = async (owner, email) => {
    setLoading(true);
    try {
      const client = generateClient();
      console.debug("fetchDocuments - owner/email:", owner, email);
      // ✅ 1. Fetch documents owned by the current user ONLY
      // SECURITY: Always use explicit owner filter to ensure users only see their own documents
      if (!owner) {
        console.error("No owner found, cannot fetch documents securely");
        toast.error("Unable to identify user. Please re-login.");
        return;
      }
      
      const ownedRes = await client.graphql({
        query: queries.listDocuments,
        variables: { 
          filter: { owner: { eq: owner } }  // ✅ Explicit filter by owner
        },
        authMode: "userPool",
      });
      console.debug("fetchDocuments - ownedRes:", ownedRes);
      const ownedDocs = ownedRes?.data?.listDocuments?.items ?? [];

      // ✅ 2. Fetch documents shared with the current user
      const sharesRes = await client.graphql({
        query: queries.listShares,
        variables: { filter: { userEmail: { eq: email } } },
        authMode: "userPool",
      });
      console.debug("fetchDocuments - sharesRes:", sharesRes);
      const shareItems = sharesRes?.data?.listShares?.items ?? [];
      const sharedDocs = shareItems
        .map((s) => (s?.document ? { ...s.document, shared: true } : null))
        .filter(Boolean);

      // ✅ 3. Merge both lists
      const allDocs = [...ownedDocs, ...sharedDocs];
  console.debug("fetchDocuments - combined docs count:", allDocs.length, { ownedDocsCount: ownedDocs.length, sharedDocsCount: sharedDocs.length });
      setDocuments(allDocs);

      if (allDocs.length === 0) {
        toast.info("ℹ️ No documents found. Create one or check shared docs.");
      }
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      const msg =
        error?.errors?.[0]?.message || error?.message || "Unknown error";
      toast.error(`Failed to fetch documents: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Delete document
  // -----------------------------
  const handleDelete = async (id, isShared) => {
    if (isShared) {
      toast.warn("⚠️ Shared documents cannot be deleted here.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      const client = generateClient();
      await client.graphql({
        query: mutations.deleteDocument,
        variables: { input: { id } },
        authMode: "userPool",
      });
      toast.success("🗑️ Document deleted.");
      // Re-fetch documents using current user's owner/email
      const current = await getCurrentUser();
      let attrs = await fetchUserAttributes();
      if (Array.isArray(attrs)) {
        const map = {};
        attrs.forEach((a) => {
          const key = a.Name || a.name;
          const val = a.Value || a.value;
          if (key) map[key] = val;
        });
        attrs = map;
      }
      const owner = attrs["cognito:username"] || current?.username;
      const email = attrs?.email || "";
      await fetchDocuments(owner, email);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document.");
    }
  };

  // -----------------------------
  // Misc actions
  // -----------------------------
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error signing out.");
    }
  };

  const handleCreate = () => navigate("/editor/new");
  const handlePreview = (id) => navigate(`/preview/${id}`);
  const handleEdit = (id) => navigate(`/editor/${id}`);

  // -----------------------------
  // Filter by tag
  // -----------------------------
  const filteredDocs = documents.filter((doc) => {
    if (!filterTag.trim()) return true;
    return (
      doc.tags?.some((t) =>
        t?.toLowerCase().includes(filterTag.toLowerCase())
      ) ?? false
    );
  });

  // -----------------------------
  // UI Rendering
  // -----------------------------
  return (
    <div style={{ maxWidth: 720, margin: "auto", padding: 20 }}>
      <h2>Welcome, {userName || "User"} 👋</h2>
      {userEmail && <p style={{ color: "#666", marginTop: -8 }}>{userEmail}</p>}

      <p style={{ fontWeight: 600, marginTop: 6 }}>
        📄 You have {documents.length}{" "}
        {documents.length === 1 ? "document" : "documents"}.
      </p>

      {/* Filter Input */}
      <div style={{ marginTop: 24 }}>
        <input
          type="text"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          placeholder="🔍 Filter by tag"
          style={{
            width: "100%",
            padding: 10,
            fontSize: 15,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </div>

      {/* Document List */}
      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p>⏳ Loading documents...</p>
        ) : filteredDocs.length === 0 ? (
          <p>No documents match your filter.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {filteredDocs.map((doc) => (
              <li
                key={doc.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <strong>{doc.title || "Untitled Document"}</strong>
                {doc.shared && (
                  <span style={{ color: "#007bff", marginLeft: 6 }}>
                    (Shared)
                  </span>
                )}
                <br />
                <small>{doc.description || "No description"}</small>
                <br />
                <small>
                  Tags: {doc.tags?.length ? doc.tags.join(", ") : "None"}
                </small>
                <br />

                <button
                  onClick={() => handlePreview(doc.id)}
                  style={{ marginTop: 6, marginRight: 8 }}
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => handleEdit(doc.id)}
                  style={{ marginTop: 6, marginRight: 8 }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.shared)}
                  style={{ marginTop: 6, color: "red" }}
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ marginTop: 28 }}>
        <button onClick={() => navigate("/profile")} style={{ marginRight: 8 }}>
          👤 Profile
        </button>
        <button onClick={handleCreate} style={{ marginRight: 8 }}>
          ➕ Create New
        </button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default Dashboard;
