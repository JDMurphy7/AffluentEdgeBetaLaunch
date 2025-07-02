import axios from 'axios';
import { Config } from '../config/index';

export class OpenAIService {
    private apiKey: string;

    constructor() {
        this.apiKey = Config.openAI.apiKey;
    }

    public async analyzeTrade(tradeData: any): Promise<any> {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: this.createPrompt(tradeData),
            max_tokens: 150,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    }

    private createPrompt(tradeData: any): string {
        return `Analyze the following trade data: ${JSON.stringify(tradeData)}`;
    }
}