import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import DocumentLibrary from './components/DocumentLibrary.js';
import MeetingArchive from './components/MeetingArchive.js';
import ChatPanel from './components/ChatPanel.js';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);

  // Mock document data for demonstration
  const documents = [
    { id: 1, title: 'Sample Document 1', content: 'This is the first document' },
    { id: 2, title: 'Sample Document 2', content: 'This is the second document' },
  ];

  const handleChatOpen = (documentId) => {
    setActiveDocument(documentId);
    setIsChatOpen(true);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={<DocumentLibrary onChatOpen={handleChatOpen} />} 
            />
            <Route path="/meetings" element={<MeetingArchive />} />
          </Routes>
        </div>

        <ChatPanel 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          documentId={activeDocument}
        />
      </div>
    </Router>
  );
}

export default App; 