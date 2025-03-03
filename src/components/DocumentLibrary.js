import React, { useState, useEffect } from 'react';
import './DocumentLibrary.css';
import documentData from '../data/documents.json';
import { useNavigate } from 'react-router-dom';

function DocumentLibrary({ onChatOpen }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sort documents by last modified date
    const sortedDocs = [...documentData].sort((a, b) => 
      new Date(b.lastModified) - new Date(a.lastModified)
    );
    setDocuments(sortedDocs);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="document-library">Loading documents...</div>;
  }

  return (
    <div className="document-library">
      <h1>Document Library</h1>
      <div className="documents-grid">
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <h3>{doc.title}</h3>
            <p className="document-category">{doc.category}</p>
            <p className="document-summary">{doc.summary}</p>
            <div className="document-meta">
              <div className="meta-row">
                <span>Author: {doc.author}</span>
                <span>{doc.pageCount} pages</span>
              </div>
              <div className="meta-row">
                <span>Created: {doc.creationDate ? new Date(doc.creationDate).toLocaleDateString() : 'Unknown'}</span>
                <span>Modified: {new Date(doc.lastModified).toLocaleDateString()}</span>
              </div>
              <div className="meta-row">
                <span>{Math.round(doc.size / 1024)} KB</span>
              </div>
            </div>
            <div className="document-actions">
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="view-pdf-btn">
                View PDF
              </a>
              <button className="chat-btn" onClick={() => onChatOpen(doc.id)}>
                Chat about this document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentLibrary; 