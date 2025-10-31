/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import {
  createDocument,
  updateDocument,
  createShare,
  deleteShare,
} from "../graphql/mutations"; // ✅ All in one place now
import { getDocument, listShares } from "../graphql/queries";
import { onUpdateDocument } from "../graphql/subscriptions";

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { uploadData, getUrl } from "aws-amplify/storage";
import ImageResize from "quill-image-resize-module-react";
import { ImageDrop } from "quill-image-drop-module";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TurndownService from "turndown";
import "./Editor.css";

// Register Quill modules
try {
  Quill.register("modules/imageResize", ImageResize);
  Quill.register("modules/imageDrop", ImageDrop);
} catch (err) {
  console.warn("Quill module registration failed:", err);
}

const turndownService = new TurndownService();
turndownService.addRule("images", {
  filter: "img",
  replacement: (content, node) => {
    const alt = node.alt || "";
    const src = node.getAttribute("src") || "";
    return src ? `![${alt}](${src})` : "";
  },
});

// 🧰 Custom Toolbar
const CustomToolbar = () => (
  <div id="editor-toolbar" className="ql-toolbar ql-snow">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value=""></option>
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-link"></button>
      <button className="ql-image"></button>
      <button className="ql-clean"></button>
    </span>
  </div>
);

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [shares, setShares] = useState([]);
  const [newShareEmail, setNewShareEmail] = useState("");
  const [newSharePermission, setNewSharePermission] = useState("READ");
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState(id);
  const quillRef = useRef(null);
  const exportRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Load or subscribe document
  useEffect(() => {
    if (currentId && currentId !== "new") {
      fetchDocument(currentId);
      subscribeToUpdates(currentId);
    } else {
      setTitle("");
      setContent("");
      setDescription("");
      setTags("");
      setShares([]);
    }
    return () => subscriptionRef.current?.unsubscribe?.();
  }, [currentId]);

  const subscribeToUpdates = (docId) => {
    const client = generateClient();
    subscriptionRef.current = client
      .graphql({
        query: onUpdateDocument,
        variables: { id: docId },
        authMode: "userPool",
      })
      .subscribe({
        next: ({ value }) => {
          const updated = value?.data?.onUpdateDocument;
          if (updated?.id === currentId) {
            setTitle(updated.title);
            setContent(updated.content);
            setDescription(updated.description || "");
            setTags(updated.tags?.join(", ") || "");
            toast.info("🔄 Document updated by collaborator");
          }
        },
        error: (err) => console.warn("Subscription error:", err),
      });
  };

  const fetchDocument = async (docId) => {
    setLoading(true);
    try {
      const client = generateClient();
      const { data } = await client.graphql({
        query: getDocument,
        variables: { id: docId },
        authMode: "userPool",
      });
      const doc = data.getDocument;
      if (doc) {
        setTitle(doc.title);
        setContent(doc.content);
        setDescription(doc.description || "");
        setTags(doc.tags?.join(", ") || "");

        const shareRes = await client.graphql({
          query: listShares,
          variables: { filter: { documentId: { eq: docId } } },
          authMode: "userPool",
        });
        setShares(shareRes.data.listShares.items || []);
      }
    } catch (err) {
      console.error("Error fetching document:", err);
      toast.error("❌ Failed to load document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (goBack = true) => {
    if (!title.trim()) return toast.warning("⚠️ Title is required.");
    setLoading(true);
    try {
      const client = generateClient();
      const tagsList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      if (currentId === "new") {
        const res = await client.graphql({
          query: createDocument,
          variables: { input: { title, content, description, tags: tagsList } },
          authMode: "userPool",
        });
        setCurrentId(res.data.createDocument.id);
        toast.success("✅ Document created!");
      } else {
        await client.graphql({
          query: updateDocument,
          variables: {
            input: { id: currentId, title, content, description, tags: tagsList },
          },
          authMode: "userPool",
        });
        toast.success("✅ Document updated!");
      }
      if (goBack) setTimeout(() => navigate("/dashboard"), 1500);
    } catch (e) {
      console.error("Error saving document:", e);
      toast.error("❌ Save failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------- Sharing (direct AppSync, no Lambda) --------
  const handleAddShare = async () => {
    if (!newShareEmail) return toast.warning("Enter user email");
    if (!currentId || currentId === "new") {
      toast.warning("⚠️ Please save the document first before sharing");
      return;
    }
    try {
      const client = generateClient();

      // Check for duplicate
      const existingRes = await client.graphql({
        query: listShares,
        variables: {
          filter: {
            documentId: { eq: currentId },
            userEmail: { eq: newShareEmail.trim() },
          },
        },
        authMode: "userPool",
      });
      const existing = existingRes?.data?.listShares?.items ?? [];
      if (existing.length > 0) {
        toast.info("ℹ️ Share already exists for this email");
        setNewShareEmail("");
        return;
      }

      // Create share
      const createRes = await client.graphql({
        query: createShare,
        variables: {
          input: {
            documentId: currentId,
            userEmail: newShareEmail.trim(),
            permission: newSharePermission,
          },
        },
        authMode: "userPool",
      });
      const created = createRes?.data?.createShare;
      if (!created) throw new Error("No share returned by API");

      setShares((prev) => [...prev, created]);
      setNewShareEmail("");
      toast.success("✅ Share added!");
    } catch (err) {
      console.error("Error adding share:", err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || "Unknown error";
      toast.error(`❌ Could not add share: ${errorMessage}`);
    }
  };

  const handleRemoveShare = async (email) => {
    try {
      const client = generateClient();
      // Find the share id first
      const listRes = await client.graphql({
        query: listShares,
        variables: {
          filter: { documentId: { eq: currentId }, userEmail: { eq: email } },
        },
        authMode: "userPool",
      });
      const share = listRes?.data?.listShares?.items?.[0];
      if (!share?.id) {
        toast.info("ℹ️ Share not found");
        return;
      }
      await client.graphql({
        query: deleteShare,
        variables: { input: { id: share.id } },
        authMode: "userPool",
      });
      setShares((prev) => prev.filter((s) => s.userEmail !== email));
      toast.success("✅ Share removed!");
    } catch (err) {
      console.error("Error removing share:", err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || "Unknown error";
      toast.error(`❌ Remove failed: ${errorMessage}`);
    }
  };
  // -------------------------

  // Image upload handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const { result } = await uploadData({
          key: `images/${Date.now()}-${file.name}`,
          data: file,
        });
        const { url } = await getUrl({ key: result.key });
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range?.index || 0, "image", url.toString(), "user");
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error("❌ Upload failed");
      }
    };
  };

  // ---- Export Handlers ----
  const handleExportPDF = () => {
    if (!exportRef.current) return;
    const clone = exportRef.current.cloneNode(true);
    clone.querySelectorAll(".ql-toolbar, .ql-tooltip, .ql-cursor").forEach((el) => el.remove());
    clone.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
    document.body.appendChild(clone);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    html2canvas(clone, { scale: 2, useCORS: true })
      .then((canvas) => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfW, pdfH);
        pdf.save(`${title || "document"}.pdf`);
      })
      .finally(() => document.body.removeChild(clone));
  };

  const handleExportMarkdown = () => {
    const md = turndownService.turndown(content || "");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "document"}.md`;
    a.click();
  };

  const handleImportMarkdown = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setContent(String(evt.target.result || ""));
    reader.readAsText(file);
  };

  const modules = useMemo(
    () => ({
      toolbar: { container: "#editor-toolbar", handlers: { image: imageHandler } },
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
      imageDrop: true,
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "clean",
  ];

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>{currentId === "new" ? "Create New Document" : "Edit Document"}</h2>
      {loading && <p>Loading...</p>}

      <div style={{ marginBottom: 16 }}>
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={{ marginBottom: 24 }} ref={exportRef}>
        <label>Content</label>
        <CustomToolbar />
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          theme="snow"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />
      </div>

      <button onClick={() => handleSave()} disabled={loading} style={{ marginRight: 10 }}>
        Save & Back
      </button>
      <button onClick={() => handleSave(false)} disabled={loading} style={{ marginRight: 10 }}>
        Save Only
      </button>
      <button onClick={handleExportPDF} style={{ marginRight: 10 }}>
        Export PDF
      </button>
      <button onClick={handleExportMarkdown} style={{ marginRight: 10 }}>
        Export MD
      </button>
      <input type="file" accept=".md" onChange={handleImportMarkdown} style={{ marginLeft: 10 }} />

      <hr />
      <h3>Sharing</h3>
      <div>
        <input
          placeholder="User email"
          value={newShareEmail}
          onChange={(e) => setNewShareEmail(e.target.value)}
          style={{ marginRight: 10, padding: 6 }}
        />
        <select
          value={newSharePermission}
          onChange={(e) => setNewSharePermission(e.target.value)}
          style={{ marginRight: 10, padding: 6 }}
        >
          <option value="READ">Read</option>
          <option value="WRITE">Write</option>
        </select>
        <button onClick={handleAddShare} style={{ padding: "6px 12px" }}>
          Add Share
        </button>
      </div>

      <ul style={{ marginTop: 10 }}>
        {shares.map((s) => (
          <li key={s.id || s.userEmail} style={{ marginBottom: 6 }}>
            {s.userEmail} ({s.permission}){" "}
            <button onClick={() => handleRemoveShare(s.userEmail)}>Remove</button>
          </li>
        ))}
      </ul>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default Editor;
