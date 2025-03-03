import React from 'react';
import './MeetingArchive.css';

function MeetingArchive() {
  const meetings = [
    {
      id: 1,
      date: '2024-03-15',
      title: 'Board Meeting',
      description: 'Quarterly board meeting discussion',
      videoUrl: 'https://example.com/video1',
      documents: [
        { id: 1, title: 'Meeting Minutes', url: '/docs/minutes1.pdf' },
        { id: 2, title: 'Presentation', url: '/docs/presentation1.pdf' },
      ],
    },
    // Add more meetings as needed
  ];

  return (
    <div className="meeting-archive">
      <h1>Meeting Archive</h1>
      <div className="meetings-list">
        {meetings.map(meeting => (
          <div key={meeting.id} className="meeting-card">
            <h3>{meeting.title}</h3>
            <p className="meeting-date">{meeting.date}</p>
            <p>{meeting.description}</p>
            <div className="meeting-resources">
              <a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer">
                Watch Recording
              </a>
              <div className="meeting-documents">
                <h4>Related Documents:</h4>
                <ul>
                  {meeting.documents.map(doc => (
                    <li key={doc.id}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MeetingArchive; 