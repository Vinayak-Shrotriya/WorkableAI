// Improved error handling and request validation

const express = require('express');
const router = express.Router();

// Validation utility function
const validateRequest = (req) => {
    const { model, messages } = req.body;
    const errors = [];
    
    if (!model) {
        errors.push('Model is required.');
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        errors.push('Messages must be a non-empty array.');
    }
    
    return errors;
};

// Error logging utility
const logError = (error) => {
    console.error(`Error: ${error}`);
};

router.post('/generate-worksheet', (req, res) => {
    const errors = validateRequest(req);
    if (errors.length > 0) {
        logError(errors.join('\n'));
        return res.status(400).json({ success: false, errors });
    }
    
    // Existing logic for handling the request
    // ...

    res.status(200).json({ success: true, data: 'Worksheet generated successfully.' });
});

module.exports = router;