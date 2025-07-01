import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTradeSchema } from "@shared/schema";
import { analyzeTradeWithAI, parseNaturalLanguageInput } from "./services/openai";
import { hubspotService } from "./services/hubspot-simple";
import { setupAuth, requireAuth, requireActiveBeta } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication system
  setupAuth(app);

  // User routes (protected)
  app.get("/api/user/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:userId/metrics", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const metrics = await storage.getPortfolioMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio metrics" });
    }
  });

  app.get("/api/portfolio/:userId/snapshots", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const snapshots = await storage.getPortfolioSnapshots(userId, limit);
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio snapshots" });
    }
  });

  // Strategy routes
  app.get("/api/strategies", async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strategies" });
    }
  });

  app.get("/api/strategies/:userId/performance", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const performance = await storage.getStrategyPerformance(userId);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strategy performance" });
    }
  });

  // Trade routes
  app.get("/api/trades/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const trades = await storage.getTrades(userId, limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const userId = req.session.userId || 1;
      
      // Handle date conversion manually
      const requestData = { ...req.body, userId };
      if (requestData.entryTime && typeof requestData.entryTime === 'string') {
        requestData.entryTime = new Date(requestData.entryTime);
      }
      if (requestData.exitTime && typeof requestData.exitTime === 'string') {
        requestData.exitTime = new Date(requestData.exitTime);
      }
      
      // Manual validation for required fields
      if (!requestData.symbol || !requestData.assetClass || !requestData.direction || 
          !requestData.entryPrice || !requestData.quantity || !requestData.entryTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const tradeData = requestData;
      
      let processedTrade = tradeData;
      
      // If natural language input is provided, parse it first
      if (tradeData.naturalLanguageInput) {
        try {
          const parsedData = await parseNaturalLanguageInput(tradeData.naturalLanguageInput);
          processedTrade = {
            ...tradeData,
            ...parsedData,
          };
        } catch (parseError) {
          console.error("Failed to parse natural language input:", parseError);
          // Continue with original data if parsing fails
        }
      }

      // Create the trade
      const trade = await storage.createTrade(processedTrade);

      // Analyze the trade with AI if it's closed
      if (trade.status === 'closed' && trade.pnl !== null) {
        try {
          const aiAnalysis = await analyzeTradeWithAI(trade);
          const updatedTrade = await storage.updateTrade(trade.id, {
            aiGrade: aiAnalysis.grade,
            aiAnalysis: aiAnalysis.analysis,
            strategyAdherence: aiAnalysis.strategyAdherence,
            riskManagementScore: aiAnalysis.riskManagementScore,
          });
          res.json(updatedTrade);
        } catch (aiError) {
          console.error("Failed to analyze trade with AI:", aiError);
          res.json(trade); // Return trade without AI analysis if AI fails
        }
      } else {
        res.json(trade);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid trade data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create trade" });
      }
    }
  });

  app.put("/api/trades/:id", async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTrade = await storage.updateTrade(tradeId, updates);
      
      // Re-analyze if the trade was closed and has PnL
      if (updates.status === 'closed' && updatedTrade.pnl !== null) {
        try {
          const aiAnalysis = await analyzeTradeWithAI(updatedTrade);
          const finalTrade = await storage.updateTrade(tradeId, {
            aiGrade: aiAnalysis.grade,
            aiAnalysis: aiAnalysis.analysis,
            strategyAdherence: aiAnalysis.strategyAdherence,
            riskManagementScore: aiAnalysis.riskManagementScore,
          });
          res.json(finalTrade);
        } catch (aiError) {
          console.error("Failed to analyze updated trade with AI:", aiError);
          res.json(updatedTrade);
        }
      } else {
        res.json(updatedTrade);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update trade" });
    }
  });

  // AI Analysis endpoint
  app.post("/api/ai/analyze-trade", async (req, res) => {
    try {
      const trade = req.body;
      const analysis = await analyzeTradeWithAI(trade);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze trade with AI" });
    }
  });

  app.post("/api/ai/parse-natural-language", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Input text is required" });
      }
      
      const parsedData = await parseNaturalLanguageInput(input);
      res.json(parsedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse natural language input" });
    }
  });

  // POST /api/trades/analyze - Analyze trade with AI (for natural language/image input)
  app.post("/api/trades/analyze", async (req, res) => {
    try {
      const { naturalLanguage, images } = req.body;
      
      if (!naturalLanguage && (!images || images.length === 0)) {
        return res.status(400).json({ error: "Natural language input or images required" });
      }

      let parsedTrade = {};
      let imageAnalysis = {};

      // Parse natural language input if provided
      if (naturalLanguage) {
        parsedTrade = await parseNaturalLanguageInput(naturalLanguage);
      }

      // For now, return success with parsed data
      // Image analysis would require additional setup
      if (images && images.length > 0) {
        imageAnalysis = { 
          imageAnalysis: `Received ${images.length} images for analysis. Image analysis feature coming soon.`
        };
      }

      res.json({
        parsedTrade,
        ...imageAnalysis,
        success: true
      });
    } catch (error) {
      console.error("Error analyzing trade:", error);
      res.status(500).json({ error: "Failed to analyze trade" });
    }
  });

  // Beta access route with HubSpot integration
  app.post("/api/beta-access", async (req, res) => {
    try {
      const betaRequestSchema = z.object({
        email: z.string().email("Invalid email address"),
        firstName: z.string().min(1, "First name is required").refine(val => val.trim().length > 0, "First name cannot be empty"),
        lastName: z.string().min(1, "Last name is required").refine(val => val.trim().length > 0, "Last name cannot be empty"),
        residency: z.string().min(1, "Country/region is required").refine(val => val.trim().length > 0, "Country/region cannot be empty"),
        company: z.string().optional(),
        tradingExperience: z.string().optional(),
        assetClasses: z.array(z.string()).optional(),
        source: z.string().optional()
      });

      const userData = betaRequestSchema.parse(req.body);
      
      // Check if contact already exists
      const emailExists = await hubspotService.checkEmailExists(userData.email);
      if (emailExists) {
        return res.status(409).json({ 
          error: "Email already registered for beta access",
          message: "This email is already in our beta program."
        });
      }

      // Create contact in HubSpot with geographic tracking
      const contact = await hubspotService.createBetaContact(
        userData.email, 
        userData.firstName, 
        userData.lastName,
        userData.residency
      );
      
      console.log(`Beta access request registered: ${userData.email}`);
      
      res.json({ 
        success: true, 
        message: "Beta access request received! We'll review your application and be in touch soon.",
        contactId: contact.id
      });
    } catch (error) {
      console.error("Beta access error:", error);
      if (error.message && error.message.includes('CRM')) {
        res.status(500).json({ error: "Registration system temporarily unavailable" });
      } else if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid email address provided" });
      } else {
        res.status(500).json({ error: "Failed to submit beta access request" });
      }
    }
  });

  // Admin routes for beta user management
  app.get("/api/admin/beta-applicants", async (req, res) => {
    try {
      // Simple admin check - you can access this with ?admin=your-admin-email
      const adminEmail = req.query.admin;
      if (!adminEmail || adminEmail !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const applicants = await hubspotService.getBetaApplicants();
      res.json(applicants);
    } catch (error) {
      console.error("Failed to fetch beta applicants:", error);
      res.status(500).json({ error: "Failed to fetch applicants" });
    }
  });

  app.post("/api/admin/approve-user", async (req, res) => {
    try {
      const { contactId, email } = req.body;
      
      if (!contactId || !email) {
        return res.status(400).json({ error: "Contact ID and email required" });
      }

      // Update status in HubSpot
      await hubspotService.updateBetaStatus(contactId, 'approved');
      
      res.json({ success: true, message: "User approved successfully" });
    } catch (error) {
      console.error("Failed to approve user:", error);
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.post("/api/admin/reject-user", async (req, res) => {
    try {
      const { contactId, email } = req.body;
      
      if (!contactId || !email) {
        return res.status(400).json({ error: "Contact ID and email required" });
      }

      // Update status in HubSpot
      await hubspotService.updateBetaStatus(contactId, 'inactive');
      
      res.json({ success: true, message: "User rejected successfully" });
    } catch (error) {
      console.error("Failed to reject user:", error);
      res.status(500).json({ error: "Failed to reject user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
