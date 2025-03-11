import { jsPDF } from 'jspdf';
import React, { useEffect, useState } from 'react';
import './NewzEra.css';

const NewzEra = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState(
    localStorage.getItem('newsNotes') || ''
  );
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mediastack.com/v1/news?access_key=d473e848300f3778c68902430a763e3f&countries=in&categories=${activeCategory}&languages=en&limit=100`
        );
        const data = await response.json();
        console.log('MediaStack API Response:', data);
        
        if (data.data) {
          setArticles(data.data || []);
        } else {
          console.error('API Error:', data.error);
          setArticles([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setArticles([]);
      }
      setIsLoading(false);
    };

    fetchNews();
  }, [activeCategory]);

  // Load saved notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = localStorage.getItem('newsNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage
  const handleSaveNotes = () => {
    localStorage.setItem('newsNotes', notes);
    setSavedNotes(notes);
    alert('Notes saved successfully!');
  };

  // Generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('NewzEra - My News Notes', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 30);
    
    // Add notes content with word wrap
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(notes, 170);
    doc.text(splitText, 20, 40);
    
    // Download PDF
    doc.save('NewzEra-Notes.pdf');
  };

  // Add this helper function at the top of your component
  const decodeHTMLEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Update the renderArticle function
  const renderArticle = (article, index) => {
    return (
      <article key={index} className="article">
        <h3>{decodeHTMLEntities(article.title)}</h3>
        {article.image && (
          <div className="article-image-container">
            <img 
              src={article.image} 
              alt={decodeHTMLEntities(article.title)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        <p>{decodeHTMLEntities(article.description)}</p>
        <div className="article-meta">
          <div className="source-author">
            <span className="source">{decodeHTMLEntities(article.source)}</span>
            {article.author && (
              <span className="author">
                By {decodeHTMLEntities(article.author)}
              </span>
            )}
          </div>
          <div className="article-details">
            <span>{new Date(article.published_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Kolkata'
            })}</span>
            <button 
              className="read-more"
              onClick={() => setSelectedArticle(article)}
            >
              Read More
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderArticleModal = () => {
    if (!selectedArticle) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button 
            className="modal-close"
            onClick={() => setSelectedArticle(null)}
          >
            ×
          </button>
          <article className="full-article">
            {selectedArticle.image && (
              <div className="full-article-image">
                <img 
                  src={selectedArticle.image} 
                  alt={decodeHTMLEntities(selectedArticle.title)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <h2>{decodeHTMLEntities(selectedArticle.title)}</h2>
            <div className="full-article-meta">
              <div className="source-author">
                <span className="source">{decodeHTMLEntities(selectedArticle.source)}</span>
                {selectedArticle.author && (
                  <span className="author">By {decodeHTMLEntities(selectedArticle.author)}</span>
                )}
              </div>
              <span className="date">{new Date(selectedArticle.published_at).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata'
              })}</span>
            </div>
            <div className="full-article-content">
              <p className="description">{decodeHTMLEntities(selectedArticle.description)}</p>
              <p className="content">{decodeHTMLEntities(selectedArticle.content || selectedArticle.description)}</p>
              <a 
                href={selectedArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-link"
              >
                View Original Article
              </a>
            </div>
          </article>
        </div>
      </div>
    );
  };

  // Add this function to format the current date
  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    };
    return new Date().toLocaleString('en-IN', options);
  };

  return (
    <div className="newzera-container">
      <div className="header-nav-container">
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <h1 onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>NewzEra</h1>
              <div className="current-date">
                {getCurrentDate()}
              </div>
            </div>
            <button onClick={() => setShowNotes(!showNotes)} className="notes-button">
              {showNotes ? 'Hide Notes' : 'Take Notes'}
            </button>
          </div>
        </header>

        <nav className="categories">
          <div className="categories-container">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <main className="main-content">
        <div className="news-container">
          <h2>Today's Top {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News</h2>

          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading news...</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="articles">
              {articles.map(renderArticle)}
            </div>
          ) : (
            <div className="no-articles">
              <p>No articles found for this category.</p>
            </div>
          )}
        </div>

        {showNotes && (
          <div className={`notes-panel ${showNotes ? 'show' : ''}`}>
            <div className="notes-header">
              <h2>My Notes</h2>
              <div className="notes-actions">
                <button 
                  className="clear-button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all notes?')) {
                      setNotes('');
                      localStorage.removeItem('newsNotes');
                      setSavedNotes('');
                    }
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              placeholder="Take notes about the news..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="notes-textarea"
            ></textarea>
            <div className="notes-footer">
              <button 
                className="download-button"
                onClick={handleDownloadPDF}
                disabled={!notes.trim()}
              >
                Download PDF
              </button>
              <button 
                className="save-button"
                onClick={handleSaveNotes}
                disabled={!notes.trim() || notes === savedNotes}
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 NewzEra. All rights reserved.</p>
        <p>Powered by MediaStack</p>
      </footer>

      {renderArticleModal()}
    </div>
  );
};

export default NewzEra; 