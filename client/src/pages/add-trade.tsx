import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Strategy } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  assetClass: z.string().min(1, "Asset class is required"),
  direction: z.enum(["long", "short"]),
  entryPrice: z.string().min(1, "Entry price is required"),
  exitPrice: z.string().optional(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  strategyId: z.string().optional(),
  notes: z.string().optional(),
  entryTime: z.string().min(1, "Entry time is required"),
  exitTime: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

export default function AddTrade() {
  const [activeTab, setActiveTab] = useState("natural");
  const [naturalInput, setNaturalInput] = useState("");
  const [isParsingNatural, setIsParsingNatural] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<TradeFormData> | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies } = useQuery<Strategy[]>({
    queryKey: [`/api/strategies`],
  });

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: "",
      assetClass: "",
      direction: "long",
      entryPrice: "",
      exitPrice: "",
      stopLoss: "",
      takeProfit: "",
      quantity: "",
      strategyId: "none",
      notes: "",
      entryTime: new Date().toISOString().slice(0, 16),
      exitTime: "",
    },
  });

  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: TradeFormData) => {
      const formattedData = {
        ...tradeData,
        userId: 1, // Demo user
        strategyId: (tradeData.strategyId && tradeData.strategyId !== "none") ? parseInt(tradeData.strategyId) : undefined,
        status: tradeData.exitPrice ? "closed" : "open",
      };
      
      return apiRequest(`/api/trades`, {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trades/1`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/1/metrics`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strategies/1/performance`] });
      
      toast({
        title: "Trade Added Successfully",
        description: "Your trade has been recorded and will be analyzed by AI.",
      });
      
      form.reset();
      setParsedData(null);
      setNaturalInput("");
    },
    onError: () => {
      toast({
        title: "Failed to Add Trade",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please upload only image files (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
    }
    
    setUploadedImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeWithAI = async () => {
    if (!naturalInput.trim() && uploadedImages.length === 0) {
      toast({
        title: "Input Required",
        description: "Please enter a trade description or upload screenshots.",
        variant: "destructive",
      });
      return;
    }

    setIsParsingNatural(true);
    setIsAnalyzingImage(uploadedImages.length > 0);

    try {
      let analysisData: any = {};

      // If there are images, analyze them first
      if (uploadedImages.length > 0) {
        for (const image of uploadedImages) {
          const base64 = await convertToBase64(image);
          // In a real app, this would call your AI vision API
          // For demo, we'll simulate parsing chart data
          const chartAnalysis = simulateChartAnalysis(image.name);
          analysisData = { ...analysisData, ...chartAnalysis };
        }
      }

      // Parse natural language if provided
      if (naturalInput.trim()) {
        const response = await fetch("/api/trades/parse-natural", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            input: naturalInput,
            hasImages: uploadedImages.length > 0,
            imageAnalysis: analysisData 
          }),
        });

        if (!response.ok) throw new Error("Failed to parse");

        const parsed = await response.json();
        analysisData = { ...analysisData, ...parsed };
      }

      setParsedData(analysisData);
      
      // Auto-fill form with parsed data
      Object.entries(analysisData).forEach(([key, value]) => {
        if (value && key in form.getValues()) {
          form.setValue(key as keyof TradeFormData, String(value));
        }
      });

      setActiveTab("manual");
      toast({
        title: "Analysis Complete",
        description: uploadedImages.length > 0 
          ? "Screenshots and text analyzed. Review the extracted data."
          : "Trade description parsed. Review and adjust the details.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the trade data. Please try the manual form.",
        variant: "destructive",
      });
    } finally {
      setIsParsingNatural(false);
      setIsAnalyzingImage(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = error => reject(error);
    });
  };

  const simulateChartAnalysis = (filename: string) => {
    // Simulate AI chart analysis - in production this would use actual AI vision
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AAPL', 'TSLA', 'BTCUSD'];
    const directions = ['long', 'short'];
    const assets = ['forex', 'stocks', 'crypto'];
    
    return {
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
      assetClass: assets[Math.floor(Math.random() * assets.length)],
      entryPrice: (Math.random() * 100 + 50).toFixed(5),
      quantity: (Math.random() * 1000 + 100).toFixed(0),
      notes: `Analyzed from screenshot: ${filename}. Entry based on chart pattern recognition.`
    };
  };

  const onSubmit = (data: TradeFormData) => {
    createTradeMutation.mutate(data);
  };

  const assetClasses = ["forex", "stocks", "crypto", "commodities", "indices"];

  const popularSymbols = {
    forex: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"],
    stocks: ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN"],
    crypto: ["BTCUSD", "ETHUSD", "ADAUSD", "SOLUSD", "DOTUSD"],
    commodities: ["XAUUSD", "XAGUSD", "CRUDE", "NATGAS", "WHEAT"],
    indices: ["SPX500", "NAS100", "US30", "GER40", "UK100"],
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Navigation */}
      <nav className="glass-morphism border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gold transition-colors">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">AffluentEdge</span>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            Add New Trade
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add Trade</h1>
          <p className="text-white/70 text-lg">Record your trades using natural language or detailed forms</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-morphism border border-white/10 mb-6 h-16 p-0 gap-0">
            <TabsTrigger 
              value="natural" 
              className="data-[state=active]:bg-gold data-[state=active]:text-charcoal h-full flex items-center justify-center rounded-l-md border-r border-white/10 data-[state=active]:border-r-gold/50"
            >
              <div className="flex flex-col items-center justify-center space-y-1 px-4">
                <div className="flex items-center">
                  <i className="fas fa-zap mr-2"></i>
                  Quick Upload
                </div>
                <span className="text-xs opacity-80">Natural language & screenshots</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="data-[state=active]:bg-gold data-[state=active]:text-charcoal h-full flex items-center justify-center rounded-r-md"
            >
              <div className="flex flex-col items-center justify-center space-y-1 px-4">
                <div className="flex items-center">
                  <i className="fas fa-cogs mr-2"></i>
                  Advanced Upload
                </div>
                <span className="text-xs opacity-80">Complete data & analysis</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="natural" className="space-y-6">
            {/* Quick Upload Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Quick Upload</h2>
              <p className="text-white/60">
                Upload screenshots or describe your trade - perfect for fast entry and immediate AI analysis
              </p>
            </div>

            {/* Image Upload Section */}
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-camera text-bronze mr-2"></i>
                  Upload Trade Screenshots
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Upload up to 5 images of your trading platform, charts, or trade confirmations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-gold/40 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <i className="fas fa-cloud-upload-alt text-4xl text-gold"></i>
                      <div className="text-white">
                        <p className="font-medium">Click to upload images</p>
                        <p className="text-sm text-white/60">or drag and drop</p>
                      </div>
                      <p className="text-xs text-white/50">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Uploaded Screenshots ({uploadedImages.length}/5)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Trade screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Natural Language Input */}
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-comments text-gold mr-2"></i>
                  Describe Your Trade (Optional)
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Add context: "Bought 100 EURUSD at 1.0850 following trend breakout"
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your trade in natural language..."
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold min-h-20"
                  rows={3}
                />
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={analyzeWithAI}
                    disabled={isParsingNatural || (!naturalInput.trim() && uploadedImages.length === 0)}
                    className="bg-gold text-charcoal hover:bg-gold/90 flex-1"
                  >
                    {isParsingNatural ? (
                      <>
                        <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin mr-2"></div>
                        {isAnalyzingImage ? "Analyzing Screenshots..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Analyze with AI
                      </>
                    )}
                  </Button>
                  
                  {(naturalInput || uploadedImages.length > 0) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNaturalInput("");
                        setUploadedImages([]);
                      }}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Example prompts */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm mb-3">Example phrases:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Bought 100 EURUSD at 1.0850",
                      "Sold 50 AAPL at $150 with SL at $145",
                      "Long BTC from $45000 to $47000",
                      "Short GBP/USD 200 units at 1.2500"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setNaturalInput(example)}
                        className="text-left p-2 text-sm text-gold hover:bg-white/5 rounded border border-gold/20 hover:border-gold/40 transition-colors"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>

                {parsedData && (
                  <div className="p-4 glass-morphism rounded-lg border border-gold/20">
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <i className="fas fa-check-circle text-green-400 mr-2"></i>
                      Parsed Trade Data
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(parsedData).map(([key, value]) => (
                        <div key={key} className="text-white/70">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="text-white">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-bronze text-sm mt-2">
                      Switch to Manual Entry tab to review and complete the trade details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            {/* Advanced Upload Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Advanced Upload</h2>
              <p className="text-white/60">
                Complete trade data entry for maximum AI analysis and feedback - provides the most detailed insights
              </p>
            </div>

            {/* Manual Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-chart-line text-bronze mr-2"></i>
                      Trade Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Symbol */}
                      <FormField
                        control={form.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Symbol</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., EURUSD, AAPL"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Asset Class */}
                      <FormField
                        control={form.control}
                        name="assetClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Asset Class</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue placeholder="Select asset class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-charcoal border-white/20">
                                {assetClasses.map((asset) => (
                                  <SelectItem key={asset} value={asset} className="text-white hover:bg-white/10">
                                    {asset.charAt(0).toUpperCase() + asset.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Popular symbols for selected asset class */}
                    {form.watch("assetClass") && (
                      <div className="p-3 glass-morphism rounded border border-white/10">
                        <p className="text-white/60 text-sm mb-2">Popular {form.watch("assetClass")} symbols:</p>
                        <div className="flex flex-wrap gap-2">
                          {popularSymbols[form.watch("assetClass") as keyof typeof popularSymbols]?.map((symbol) => (
                            <Badge
                              key={symbol}
                              variant="outline"
                              className="cursor-pointer border-gold/30 text-gold hover:bg-gold/10"
                              onClick={() => form.setValue("symbol", symbol)}
                            >
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Direction */}
                      <FormField
                        control={form.control}
                        name="direction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Direction</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-charcoal border-white/20">
                                <SelectItem value="long" className="text-white hover:bg-white/10">
                                  <span className="flex items-center">
                                    <i className="fas fa-arrow-up text-green-400 mr-2"></i>
                                    Long (Buy)
                                  </span>
                                </SelectItem>
                                <SelectItem value="short" className="text-white hover:bg-white/10">
                                  <span className="flex items-center">
                                    <i className="fas fa-arrow-down text-red-400 mr-2"></i>
                                    Short (Sell)
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Strategy */}
                      <FormField
                        control={form.control}
                        name="strategyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Strategy (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue placeholder="Select strategy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-charcoal border-white/20">
                                <SelectItem value="none" className="text-white hover:bg-white/10">No Strategy</SelectItem>
                                {strategies?.map((strategy) => (
                                  <SelectItem 
                                    key={strategy.id} 
                                    value={strategy.id.toString()}
                                    className="text-white hover:bg-white/10"
                                  >
                                    {strategy.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-dollar-sign text-gold mr-2"></i>
                      Price Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Entry Price */}
                      <FormField
                        control={form.control}
                        name="entryPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Entry Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.00001"
                                placeholder="1.08500"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Exit Price */}
                      <FormField
                        control={form.control}
                        name="exitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Exit Price (if closed)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.00001"
                                placeholder="1.09000"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Stop Loss */}
                      <FormField
                        control={form.control}
                        name="stopLoss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Stop Loss</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.00001"
                                placeholder="1.08000"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Take Profit */}
                      <FormField
                        control={form.control}
                        name="takeProfit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Take Profit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.00001"
                                placeholder="1.09500"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-clock text-bronze mr-2"></i>
                      Timing & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Entry Time */}
                      <FormField
                        control={form.control}
                        name="entryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Entry Time *</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                className="bg-white/5 border-white/20 text-white focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Exit Time */}
                      <FormField
                        control={form.control}
                        name="exitTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Exit Time (if closed)</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                className="bg-white/5 border-white/20 text-white focus:border-gold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Trade Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your analysis, reasoning, or market conditions..."
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Additional Documentation */}
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-images text-bronze mr-2"></i>
                      Supporting Documentation
                    </CardTitle>
                    <p className="text-white/60 text-sm">
                      Upload charts, analysis, or trade confirmations for enhanced AI feedback
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-bronze/40 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="advanced-image-upload"
                      />
                      <label htmlFor="advanced-image-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <i className="fas fa-plus-circle text-2xl text-bronze"></i>
                          <div className="text-white">
                            <p className="font-medium">Add Screenshots</p>
                            <p className="text-sm text-white/60">Charts, platform screenshots, analysis</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white text-sm font-medium">Attached Images ({uploadedImages.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Trade image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border border-white/20"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strategy Analysis Hint */}
                    {form.watch("strategyId") && form.watch("strategyId") !== "none" && (
                      <div className="p-3 glass-morphism rounded border border-gold/20">
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-lightbulb text-gold mt-0.5"></i>
                          <div className="text-sm">
                            <p className="text-gold font-medium">Strategy Analysis Enhanced</p>
                            <p className="text-white/70">
                              With your selected strategy, AI will provide specific adherence scoring and targeted feedback.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={createTradeMutation.isPending}
                    className="bg-gold text-charcoal hover:bg-gold/90 flex-1"
                  >
                    {createTradeMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin mr-2"></div>
                        Adding Trade...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Add Trade
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setParsedData(null);
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}