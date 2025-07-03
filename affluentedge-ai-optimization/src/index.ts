import express from 'express';
import { OptimizerAgent } from './agents/optimizer';
import { LegacyAgent } from './agents/legacyAgent';
import { EntryManager } from './journal/entryManager';
import { OpenAIService } from './services/openaiService';
import CostReducer from './services/costReducer';
import config from './config';

const app = express();
const port = process.env.PORT || 3000;

const optimizerAgent = new OptimizerAgent();
const legacyAgent = new LegacyAgent();
const entryManager = new EntryManager();
const openAIService = new OpenAIService();
const costReducer = CostReducer;

app.use(express.json());

// Remove or implement getTrades and createTrade on EntryManager
// app.get('/api/trades', async (req, res) => {
//     try {
//         const trades = await entryManager.getTrades();
//         res.json(trades);
//     } catch (error) {
//         res.status(500).send('Error retrieving trades');
//     }
// });

// app.post('/api/trades', async (req, res) => {
//     try {
//         const trade = await entryManager.createTrade(req.body);
//         res.status(201).json(trade);
//     } catch (error) {
//         res.status(500).send('Error creating trade');
//     }
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});