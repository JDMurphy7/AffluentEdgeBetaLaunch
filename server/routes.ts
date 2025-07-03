import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTradeSchema } from "@shared/schema";
import { analyzeTradeWithAI, parseNaturalLanguageInput } from "./services/openai";
import { hubspotService } from "./services/hubspot-simple";
import { emailService } from "./services/email";
import { setupAuth, requireAuth, requireActiveBeta, hashPassword, comparePasswords } from "./auth";
import { setupAuth as setupReplitAuth, isAuthenticated, isAdmin } from "./replitAuth";

// === AGENT SYSTEM INTEGRATION ===
import { Orchestrator } from './agents/core/orchestrator.js';
import { AIIntegrationAgent } from './agents/ai-integration/ai-integration-agent.js';
import { DatabaseAgent } from './agents/database/database-agent.js';
import { TradeAgent } from './agents/trade-processing/trade-agent.js';
import { PortfolioAgent } from './agents/portfolio-analytics/portfolio-agent.js';
import type { AgentConfig } from './agents/core/types.js';

// Fallbacks for agent methods (original functions)
const fallbackAnalyzeTrade = async (trade: any) => await analyzeTradeWithAI(trade);
const fallbackGetPortfolioMetrics = async (userId: number) => await storage.getPortfolioMetrics(userId);
const fallbackGetTrades = async (userId: number, limit?: number) => await storage.getTrades(userId, limit);

// Agent configs (can be loaded from config file/env)
const aiAgentConfig: AgentConfig = { id: 'ai', name: 'AI Integration Agent', enabled: true, priority: 1, timeout: 10000 };
const dbAgentConfig: AgentConfig = { id: 'db', name: 'Database Agent', enabled: true, priority: 2, timeout: 5000 };
const tradeAgentConfig: AgentConfig = { id: 'trade', name: 'Trade Agent', enabled: true, priority: 3, timeout: 2000 };
const portfolioAgentConfig: AgentConfig = { id: 'portfolio', name: 'Portfolio Agent', enabled: true, priority: 4, timeout: 2000 };

const orchestrator = new Orchestrator();
const aiAgent = new AIIntegrationAgent(aiAgentConfig, fallbackAnalyzeTrade);
const dbAgent = new DatabaseAgent(dbAgentConfig, fallbackGetPortfolioMetrics);
const tradeAgent = new TradeAgent(tradeAgentConfig, () => Promise.resolve(null));
const portfolioAgent = new PortfolioAgent(portfolioAgentConfig, () => Promise.resolve(null));

orchestrator.registerAgent(aiAgent);
orchestrator.registerAgent(dbAgent);
orchestrator.registerAgent(tradeAgent);
orchestrator.registerAgent(portfolioAgent);
// === END AGENT SYSTEM INTEGRATION ===

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication systems
  setupAuth(app);
  // Note: Replit Auth requires additional environment variables
  // For now, we'll use a simpler admin check

  // Simple admin authentication for immediate use
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, adminKey } = req.body;
      
      // Simple admin check - in production, this would be more secure
      if (email === 'theaffluentedge@gmail.com' && adminKey === 'admin2025') {
        req.session.adminUser = { email, isAdmin: true };
        res.json({ success: true, user: { email, isAdmin: true } });
      } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/admin/user', async (req, res) => {
    try {
      if (req.session.adminUser?.isAdmin) {
        res.json(req.session.adminUser);
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.post('/api/admin/logout', async (req, res) => {
    req.session.adminUser = null;
    res.json({ success: true });
  });


  // Test HubSpot email
  app.post('/api/test-hubspot-email', async (req, res) => {
    try {
      const { email, firstName } = req.body;
      
      console.log(`Testing HubSpot email send to: ${email}`);
      
      // Create and send email via HubSpot
      const emailSent = await hubspotService.sendWelcomeEmail('test-contact', email, firstName);
      
      res.json({ 
        success: true, 
        message: 'HubSpot email test completed',
        emailSent 
      });
    } catch (error) {
      console.error('HubSpot email test failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simple admin middleware
  const requireSimpleAdmin = (req: any, res: any, next: any) => {
    if (req.session.adminUser?.isAdmin) {
      next();
    } else {
      res.status(401).json({ error: "Admin authentication required" });
    }
  };

  // Beta user authentication system
  app.post('/api/auth/beta-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      // Check if user exists in our database
      const existingUser = await storage.getUserByEmail(email);
      if (!existingUser) {
        console.warn(`[LOGIN] No user found for email: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check beta status
      if (existingUser.betaStatus !== 'approved' && existingUser.betaStatus !== 'active') {
        console.warn(`[LOGIN] User not approved: ${email}`);
        return res.status(403).json({ error: 'Beta access not approved' });
      }
      
      // Check password using proper hashing
      let isValidPassword = false;
      try {
        isValidPassword = await comparePasswords(password, existingUser.password);
      } catch (error) {
        // If password comparison fails (old unhashed passwords), also check for default password
        isValidPassword = password === 'beta2025';
        if (!isValidPassword) {
          console.error(`[LOGIN] Password compare error for ${email}:`, error);
        }
      }
      
      if (!isValidPassword) {
        console.warn(`[LOGIN] Invalid password for: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create session
      req.session.betaUser = {
        id: existingUser.id,
        email: existingUser.email,
        firstName: String(existingUser.firstName ?? ''),
        lastName: String(existingUser.lastName ?? ''),
        betaStatus: existingUser.betaStatus
      };
      
      res.json({ 
        success: true, 
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          betaStatus: existingUser.betaStatus
        }
      });
    } catch (error) {
      console.error('[LOGIN] Beta login error:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/beta-user', async (req, res) => {
    try {
      if (req.session.betaUser) {
        res.json(req.session.betaUser);
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.post('/api/auth/beta-logout', async (req, res) => {
    req.session.betaUser = null;
    res.json({ success: true });
  });

  // Password reset functionality
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Check if user exists and is approved
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security, always return success even if email doesn't exist
        return res.json({ success: true, message: 'If this email is registered, you will receive reset instructions' });
      }
      
      if (user.betaStatus !== 'approved' && user.betaStatus !== 'active') {
        return res.json({ success: true, message: 'If this email is registered, you will receive reset instructions' });
      }
      
      // Generate a simple reset token (in production, use crypto.randomBytes)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      // Store reset token directly in user record temporarily (simplified for demo)
      // In production, create a separate password_reset_tokens table
      await storage.updateUser(user.id, { 
        resetToken, 
        resetExpires: resetExpires.toISOString() 
      });
      
      // Send reset email via HubSpot
      try {
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
        
        // Send password reset email via HubSpot (simplified version)
        // Note: Creating a custom password reset email template for production
        const emailSent = await hubspotService.sendWelcomeEmail(
          user.hubspotContactId || 'unknown',
          user.email,
          user.firstName ?? undefined
        );
        
        // Log the reset information for development
        console.log(`Password reset requested for: ${user.email}`);
        console.log(`Reset token: ${resetToken} (expires in 30 minutes)`);
        console.log(`Reset URL: ${resetUrl}`);
        
        if (emailSent) {
          console.log(`Password reset email sent to: ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
      }
      
      res.json({ 
        success: true, 
        message: 'If this email is registered, you will receive reset instructions'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to process reset request' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'Email, token, and new password are required' });
      }
      
      // Get user first
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify reset token (check database)
      if (!user.resetToken || 
          user.resetToken !== token || 
          !user.resetExpires ||
          new Date() > new Date(user.resetExpires)) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Hash the new password before storing
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Clear the reset token from user record
      await storage.updateUser(user.id, { 
        resetToken: null, 
        resetExpires: null 
      });
      
      res.json({ 
        success: true, 
        message: 'Password updated successfully. You can now log in with your new password.' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Beta user middleware
  const requireBetaAuth = (req: any, res: any, next: any) => {
    if (req.session.betaUser) {
      next();
    } else {
      res.status(401).json({ error: 'Authentication required' });
    }
  };

  // Admin routes with simple authentication
  app.get("/api/admin/beta-applicants", requireSimpleAdmin, async (req, res) => {
    try {
      console.log("Fetching beta applicants for admin user");
      const applicants = await hubspotService.getBetaApplicants();
      res.json(applicants);
    } catch (error) {
      console.error("Failed to fetch beta applicants:", error);
      res.status(500).json({ error: "Failed to fetch applicants" });
    }
  });

  // --- ADMIN APPROVAL: Approve beta user, hash password, update DB, send welcome email ---
  app.post("/api/admin/approve-user", requireSimpleAdmin, async (req, res) => {
    try {
      const { contactId, email, firstName, lastName } = req.body;
      if (!contactId || !email) {
        return res.status(400).json({ error: "Contact ID and email required" });
      }

      // Update status in HubSpot
      await hubspotService.updateBetaStatus(contactId, 'approved');

      // Always generate a password (custom for Jamie, default for others)
      const password = email === 'jamiedeanmurphy@gmail.com' ? '@Zeusyboy12' : 'beta2025';
      const hashedPassword = await hashPassword(password);
      let userId = null;
      let userWasCreated = false;
      let userWasUpdated = false;
      try {
        const existingUser = await storage.getUserByEmail(email);
        if (!existingUser) {
          // Create new user
          const newUser = await storage.createUser({
            email,
            password: hashedPassword,
            firstName: firstName || '',
            lastName: lastName || '',
            betaStatus: 'approved',
            accountBalance: '25000.00',
            hubspotContactId: contactId
          });
          userId = newUser.id;
          userWasCreated = true;
          console.log(`[APPROVE] Created new user: ${email} (ID: ${userId})`);
        } else {
          // Update existing user: always update password and status
          await storage.updateUser(existingUser.id, {
            password: hashedPassword,
            betaStatus: 'approved',
            hubspotContactId: contactId
          });
          userId = existingUser.id;
          userWasUpdated = true;
          console.log(`[APPROVE] Updated user: ${email} (ID: ${userId})`);
        }
      } catch (dbError) {
        console.error("[APPROVE] DB error:", dbError);
        // Continue to email even if DB fails
      }

      // Send welcome email with credentials (if possible)
      let emailSent = false;
      try {
        // You may want to use a custom email template to include credentials
        emailSent = await hubspotService.sendWelcomeEmail(contactId, email, firstName, password);
        if (emailSent) {
          console.log(`[APPROVE] Welcome email sent to: ${email}`);
        } else {
          console.error(`[APPROVE] Failed to send welcome email to: ${email}`);
        }
      } catch (emailErr) {
        console.error(`[APPROVE] Welcome email error:`, emailErr);
      }

      res.json({
        success: true,
        message: `User ${userWasCreated ? 'created' : userWasUpdated ? 'updated' : 'processed'} and welcome email sent`,
        emailSent,
        userId
      });
    } catch (error) {
      console.error("[APPROVE] Failed to approve user:", error);
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.post("/api/admin/reject-user", requireSimpleAdmin, async (req, res) => {
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

  app.post("/api/admin/block-user", requireSimpleAdmin, async (req, res) => {
    try {
      const { contactId, email } = req.body;
      
      if (!contactId || !email) {
        return res.status(400).json({ error: "Contact ID and email required" });
      }

      // Update status in HubSpot to blocked
      await hubspotService.updateBetaStatus(contactId, 'inactive');
      
      // Also update user status in our database if they exist
      const user = await storage.getUserByEmail(email);
      if (user) {
        await storage.updateUserBetaStatus(user.id, 'blocked');
      }
      
      res.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
      console.error("Failed to block user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.post("/api/admin/delete-user", requireSimpleAdmin, async (req, res) => {
    try {
      const { contactId, email } = req.body;
      
      if (!contactId || !email) {
        return res.status(400).json({ error: "Contact ID and email required" });
      }

      // First remove user from our database if they exist
      const user = await storage.getUserByEmail(email);
      if (user) {
        await storage.deleteUser(user.id); // Fully remove user from DB
      }
      
      // Update status in HubSpot to 'deleted'
      await hubspotService.updateBetaStatus(contactId, 'deleted' as any);
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // New endpoint to get user credentials for admin panel
  app.get("/api/admin/user-credentials", requireSimpleAdmin, async (req, res) => {
    try {
      // Get all approved/active users with their credentials
      const users = await storage.getAllUsersWithPasswords();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch user credentials:", error);
      res.status(500).json({ error: "Failed to fetch user credentials" });
    }
  });

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
  app.get("/api/portfolio/metrics", requireBetaAuth, async (req, res) => {
    const userId = (req.session as any).betaUser.id;
    let agentResult;
    let usedAgent = false;
    try {
      agentResult = await dbAgent.getPortfolioMetricsOptimized(userId);
      usedAgent = agentResult.source === 'agent';
      res.set('X-Agent-Used', usedAgent ? 'dbAgent' : 'fallback');
      res.set('X-Cache-Hit', String(!!agentResult.cacheHit));
      res.set('X-Execution-Time', String(agentResult.executionTime));
      if (agentResult.success) return res.json(agentResult.data);
      // fallback handled in agent
      return res.status(500).json({ error: agentResult.error || 'Failed to fetch portfolio metrics' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch portfolio metrics' });
    }
  });

  app.get("/api/portfolio/snapshots", requireBetaAuth, async (req, res) => {
    try {
      const userId = (req.session as any).betaUser.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const snapshots = await storage.getPortfolioSnapshots(userId, limit);
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio snapshots" });
    }
  });

  // Legacy routes for compatibility
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
  app.get("/api/trades", requireBetaAuth, async (req, res) => {
    const userId = (req.session as any).betaUser.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    let agentResult;
    let usedAgent = false;
    try {
      agentResult = await dbAgent.getTradesOptimized(userId, limit);
      usedAgent = agentResult.source === 'agent';
      res.set('X-Agent-Used', usedAgent ? 'dbAgent' : 'fallback');
      res.set('X-Cache-Hit', String(!!agentResult.cacheHit));
      res.set('X-Execution-Time', String(agentResult.executionTime));
      if (agentResult.success) return res.json(agentResult.data);
      // fallback handled in agent
      return res.status(500).json({ error: agentResult.error || 'Failed to fetch trades' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch trades' });
    }
  });

  // Legacy route for compatibility
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

  app.post("/api/trades", requireBetaAuth, async (req, res) => {
    try {
      const userId = (req.session as any).betaUser.id;
      const requestData = { ...req.body, userId };
      if (requestData.entryTime && typeof requestData.entryTime === 'string') {
        requestData.entryTime = new Date(requestData.entryTime);
      }
      if (requestData.exitTime && typeof requestData.exitTime === 'string') {
        requestData.exitTime = new Date(requestData.exitTime);
      }
      if (!requestData.symbol || !requestData.assetClass || !requestData.direction || 
          !requestData.entryPrice || !requestData.quantity || !requestData.entryTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      let tradeData = requestData;
      if (tradeData.naturalLanguageInput) {
        try {
          const parsedData = await parseNaturalLanguageInput(tradeData.naturalLanguageInput);
          tradeData = { ...tradeData, ...parsedData };
        } catch (parseError) {
          console.error("Failed to parse natural language input:", parseError);
        }
      }
      const trade = await storage.createTrade(tradeData);
      if (trade.status === 'closed' && trade.pnl !== null) {
        try {
          // Map trade to required Trade type for agent
          const agentTrade = {
            symbol: trade.symbol,
            direction: trade.direction,
            entry: Number(trade.entryPrice),
            exit: trade.exitPrice !== null ? Number(trade.exitPrice) : 0,
            stopLoss: trade.stopLoss !== null ? Number(trade.stopLoss) : 0,
            takeProfit: trade.takeProfit !== null ? Number(trade.takeProfit) : 0,
          };
          const agentResult = await aiAgent.analyzeTradeOptimized(agentTrade);
          res.set('X-Agent-Used', agentResult.source === 'agent' ? 'aiAgent' : 'fallback');
          res.set('X-Cache-Hit', String(!!agentResult.cacheHit));
          res.set('X-Execution-Time', String(agentResult.executionTime));
          if (agentResult.success && agentResult.data) {
            const updatedTrade = await storage.updateTrade(trade.id, agentResult.data);
            return res.json(updatedTrade);
          } else {
            return res.json(trade);
          }
        } catch (aiError) {
          console.error("Failed to analyze trade with AI agent:", aiError);
          return res.json(trade);
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
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters")
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
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

      // Create contact in HubSpot (do NOT send password)
      const contact = await hubspotService.createBetaContact(
        userData.email, 
        userData.firstName, 
        userData.lastName,
        userData.residency
      );

      // Hash password and store in app DB (pending approval)
      const hashedPassword = await hashPassword(userData.password);
      await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        betaStatus: 'pending',
        hubspotContactId: contact.id
      });

      // Send confirmation email (not credentials, just confirmation)
      try {
        await emailService.sendWelcomeEmail({
          firstName: userData.firstName,
          email: userData.email,
          loginUrl: `${process.env.BASE_URL || 'https://affluentedge.app'}/auth`,
          unsubscribeUrl: `${process.env.BASE_URL || 'https://affluentedge.app'}/unsubscribe`
        });
      } catch (emailErr) {
        console.error('[BETA ACCESS] Failed to send confirmation email:', emailErr);
      }

      console.log(`[BETA ACCESS] Registered: ${userData.email}`);

      res.json({ 
        success: true, 
        message: "Beta access request received! We'll review your application and be in touch soon.",
        contactId: contact.id
      });
    } catch (error) {
      console.error('Beta access error:', error instanceof Error ? error.message : error);
      const err = error as any;
      if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string' && err.message.includes('CRM')) {
        res.status(500).json({ error: "Registration system temporarily unavailable" });
      } else if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues?.[0]?.message || "Invalid registration data" });
      } else {
        res.status(500).json({ error: "Failed to submit beta access request" });
      }
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
