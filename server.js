const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve all files from the current folder (including src, admin, etc.)

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'src/assets/uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Make filename unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const DATA_FILE = path.join(__dirname, 'data', 'content.json');

// Helper to read data
function readData() {
    if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE);
        return JSON.parse(rawData);
    }
    return {
        hero: { slides: [], headline: "", subtext: "", badges: [], primaryDonateBtn: "", secondaryPartnerBtn: "" },
        whatWeDo: { title: "", subtitle: "", cards: [] },
        impact: { title: "", subtitle: "", cards: [] },
        whyThisMatters: { title: "", paragraphs: [] },
        donations: { title: "", subtitle: "", gatewayIntegrationText: "", tiers: [] },
        partners: { title: "", subtitle: "", introHeading: "", introText: "", badges: [], contactEmail: "", contactBtnText: "", features: [] },
        footer: { brandTagline: "", brandCertText: "", emails: [], phones: [], social: [], copyright: "" }
    };
}

// Helper to write data
function writeData(data) {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Ensure data exists initially
if (!fs.existsSync(DATA_FILE)) {
    writeData(readData());
}


// Simple Auth (Hardcoded for this lightweight setup, ideally use environment variables)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'sgss2025';

// API Endpoints

// POST: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // In a real app, use JWT or sessions. 
        // For this lightweight requirement, we will just return a success flag
        // that the client can store in local/session storage.
        res.json({ success: true, token: 'simple-auth-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// GET: Fetch Content
app.get('/api/content', (req, res) => {
    const data = readData();
    res.json(data);
});

// POST: Update Content
app.post('/api/content', (req, res) => {
    // Check auth simple way (expecting token in header for minimal security)
    const token = req.headers['authorization'];
    if (token !== 'Bearer simple-auth-token-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const newData = req.body;
    writeData(newData);
    res.json({ success: true, message: 'Content updated successfully' });
});

// PUT: Edit specific card
app.put('/api/card/:id', (req, res) => {
    const token = req.headers['authorization'];
    if (token !== 'Bearer simple-auth-token-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const data = readData();
    const cardIndex = data.impactCards.findIndex(c => c.id === id);

    if (cardIndex === -1) {
        return res.status(404).json({ error: 'Card not found' });
    }

    data.impactCards[cardIndex] = { ...data.impactCards[cardIndex], ...req.body, id };
    writeData(data);
    res.json({ success: true, message: 'Card updated successfully' });
});

// DELETE: Delete specific card
app.delete('/api/card/:id', (req, res) => {
    const token = req.headers['authorization'];
    if (token !== 'Bearer simple-auth-token-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const data = readData();
    const initialLength = data.impactCards.length;

    data.impactCards = data.impactCards.filter(card => card.id !== id);

    if (data.impactCards.length === initialLength) {
        return res.status(404).json({ error: 'Card not found' });
    }

    writeData(data);
    res.json({ success: true, message: 'Card deleted successfully' });
});

// POST: Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    const token = req.headers['authorization'];
    if (token !== 'Bearer simple-auth-token-123') {
        // Clean up uploaded file if unauthorized
        if (req.file) { fs.unlinkSync(req.file.path); }
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    // Return the path relative to the root (so the frontend can use it directly like 'src/assets/uploads/...')
    const imagePath = `src/assets/uploads/${req.file.filename}`;
    res.json({ success: true, path: imagePath });
});


// Catch-all to serve admin panel (basic route handling)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Catch-all for main site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
