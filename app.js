// Global variables
let textInput;
let wordCounter;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    textInput = document.getElementById('textInput');
    wordCounter = new WordCounter();
    
    // Bind button events directly
    document.getElementById('clearBtn').onclick = function() {
        clearText();
    };
    
    document.getElementById('copyBtn').onclick = function() {
        copyText();
    };
    
    document.getElementById('exportBtn').onclick = function() {
        exportText();
    };
    
    document.getElementById('uppercaseBtn').onclick = function() {
        changeCase('upper');
    };
    
    document.getElementById('lowercaseBtn').onclick = function() {
        changeCase('lower');
    };
    
    document.getElementById('titlecaseBtn').onclick = function() {
        changeCase('title');
    };
    
    // Bind text input events
    textInput.addEventListener('input', updateStats);
    textInput.addEventListener('paste', function() {
        setTimeout(updateStats, 10);
    });
    
    // Initial stats update
    updateStats();
});

class WordCounter {
    constructor() {
        this.charWithSpaces = document.getElementById('charWithSpaces');
        this.charWithoutSpaces = document.getElementById('charWithoutSpaces');
        this.wordCount = document.getElementById('wordCount');
        this.sentenceCount = document.getElementById('sentenceCount');
        this.paragraphCount = document.getElementById('paragraphCount');
        this.lineCount = document.getElementById('lineCount');
        this.readingTime = document.getElementById('readingTime');
        this.avgWordsPerSentence = document.getElementById('avgWordsPerSentence');
        this.charFrequency = document.getElementById('charFrequency');
        this.keywordDensity = document.getElementById('keywordDensity');
    }

    analyzeText(text) {
        const stats = {
            charWithSpaces: text.length,
            charWithoutSpaces: text.replace(/\s/g, '').length,
            wordCount: this.countWords(text),
            sentenceCount: this.countSentences(text),
            paragraphCount: this.countParagraphs(text),
            lineCount: this.countLines(text),
            readingTime: this.calculateReadingTime(text),
            avgWordsPerSentence: 0
        };

        if (stats.sentenceCount > 0) {
            stats.avgWordsPerSentence = Math.round(stats.wordCount / stats.sentenceCount * 10) / 10;
        }

        return stats;
    }

    countWords(text) {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    countSentences(text) {
        if (!text.trim()) return 0;
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        return sentences.length;
    }

    countParagraphs(text) {
        if (!text.trim()) return 0;
        const paragraphs = text.split(/\n+/).filter(paragraph => paragraph.trim().length > 0);
        return Math.max(1, paragraphs.length);
    }

    countLines(text) {
        if (!text.trim()) return 0;
        return text.split('\n').length;
    }

    calculateReadingTime(text) {
        const wordCount = this.countWords(text);
        const wordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return Math.max(0, minutes);
    }

    updateStatElements(stats) {
        this.charWithSpaces.textContent = stats.charWithSpaces.toLocaleString();
        this.charWithoutSpaces.textContent = stats.charWithoutSpaces.toLocaleString();
        this.wordCount.textContent = stats.wordCount.toLocaleString();
        this.sentenceCount.textContent = stats.sentenceCount.toLocaleString();
        this.paragraphCount.textContent = stats.paragraphCount.toLocaleString();
        this.lineCount.textContent = stats.lineCount.toLocaleString();
        this.readingTime.textContent = `${stats.readingTime} min${stats.readingTime !== 1 ? 's' : ''}`;
        this.avgWordsPerSentence.textContent = stats.avgWordsPerSentence;
    }

    updateCharacterFrequency(text) {
        if (!text.trim()) {
            this.charFrequency.innerHTML = '<p class="analysis-card__empty">Start typing to see character frequency analysis...</p>';
            return;
        }

        const frequency = {};
        const textForAnalysis = text.toLowerCase();
        
        for (let char of textForAnalysis) {
            if (char.match(/[a-z0-9\s.,!?;:'"()-]/)) {
                const displayChar = char === ' ' ? 'space' : char;
                frequency[displayChar] = (frequency[displayChar] || 0) + 1;
            }
        }

        const sortedChars = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        if (sortedChars.length === 0) {
            this.charFrequency.innerHTML = '<p class="analysis-card__empty">No characters to analyze...</p>';
            return;
        }

        const html = `
            <ul class="frequency-list">
                ${sortedChars.map(([char, count]) => `
                    <li class="frequency-item">
                        <span class="frequency-item__char">${char}</span>
                        <span class="frequency-item__count">${count}</span>
                    </li>
                `).join('')}
            </ul>
        `;

        this.charFrequency.innerHTML = html;
    }

    updateWordFrequency(text) {
        if (!text.trim()) {
            this.keywordDensity.innerHTML = '<p class="analysis-card__empty">Start typing to see word frequency analysis...</p>';
            return;
        }

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);

        if (words.length === 0) {
            this.keywordDensity.innerHTML = '<p class="analysis-card__empty">No words to analyze...</p>';
            return;
        }

        const frequency = {};
        
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        const sortedWords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        const html = `
            <ul class="word-frequency-list">
                ${sortedWords.map(([word, count]) => `
                    <li class="word-frequency-item">
                        <span class="word-frequency-item__word">${word}</span>
                        <span class="word-frequency-item__count">${count}</span>
                    </li>
                `).join('')}
            </ul>
        `;

        this.keywordDensity.innerHTML = html;
    }
}

// Global functions for button actions
function updateStats() {
    const text = textInput.value;
    const stats = wordCounter.analyzeText(text);
    
    wordCounter.updateStatElements(stats);
    wordCounter.updateCharacterFrequency(text);
    wordCounter.updateWordFrequency(text);
}

function clearText() {
    textInput.value = '';
    updateStats();
    textInput.focus();
    showButtonFeedback(document.getElementById('clearBtn'), 'Cleared!', 'success');
}

function copyText() {
    const text = textInput.value;
    
    if (!text.trim()) {
        showButtonFeedback(document.getElementById('copyBtn'), 'Nothing to copy!', 'error');
        return;
    }

    try {
        navigator.clipboard.writeText(text).then(() => {
            showButtonFeedback(document.getElementById('copyBtn'), 'Copied!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            textInput.select();
            document.execCommand('copy');
            showButtonFeedback(document.getElementById('copyBtn'), 'Copied!', 'success');
        });
    } catch (err) {
        textInput.select();
        document.execCommand('copy');
        showButtonFeedback(document.getElementById('copyBtn'), 'Copied!', 'success');
    }
}

function exportText() {
    const text = textInput.value;
    
    if (!text.trim()) {
        showButtonFeedback(document.getElementById('exportBtn'), 'Nothing to export!', 'error');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `text-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showButtonFeedback(document.getElementById('exportBtn'), 'Exported!', 'success');
}

function changeCase(caseType) {
    const text = textInput.value;
    
    if (!text.trim()) {
        const buttonId = caseType === 'upper' ? 'uppercaseBtn' : 
                        caseType === 'lower' ? 'lowercaseBtn' : 'titlecaseBtn';
        showButtonFeedback(document.getElementById(buttonId), 'No text to convert!', 'error');
        return;
    }

    let newText;
    
    switch (caseType) {
        case 'upper':
            newText = text.toUpperCase();
            break;
        case 'lower':
            newText = text.toLowerCase();
            break;
        case 'title':
            newText = toTitleCase(text);
            break;
        default:
            return;
    }

    textInput.value = newText;
    updateStats();
    
    const buttonId = caseType === 'upper' ? 'uppercaseBtn' : 
                    caseType === 'lower' ? 'lowercaseBtn' : 'titlecaseBtn';
    showButtonFeedback(document.getElementById(buttonId), 'Applied!', 'success');
}

function toTitleCase(text) {
    return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function showButtonFeedback(button, message, type) {
    const originalText = button.textContent;
    
    button.textContent = message;
    button.classList.add(type);
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove(type);
    }, 1500);
}

// Additional utility functions
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement.tagName === 'TEXTAREA') {
        e.preventDefault();
        document.activeElement.select();
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});