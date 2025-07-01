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
      strategyId: "",
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
        strategyId: tradeData.strategyId ? parseInt(tradeData.strategyId) : undefined,
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

  const parseNaturalLanguage = async () => {
    if (!naturalInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your trade description.",
        variant: "destructive",
      });
      return;
    }

    setIsParsingNatural(true);
    try {
      const response = await fetch("/api/trades/parse-natural", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: naturalInput }),
      });

      if (!response.ok) throw new Error("Failed to parse");

      const parsed = await response.json();
      setParsedData(parsed);
      
      // Auto-fill form with parsed data
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && key in form.getValues()) {
          form.setValue(key as keyof TradeFormData, String(value));
        }
      });

      setActiveTab("manual");
      toast({
        title: "Trade Parsed Successfully",
        description: "Review and adjust the details before saving.",
      });
    } catch (error) {
      toast({
        title: "Parsing Failed",
        description: "Could not parse the trade description. Please try the manual form.",
        variant: "destructive",
      });
    } finally {
      setIsParsingNatural(false);
    }
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
          <TabsList className="grid w-full grid-cols-2 glass-morphism border border-white/10 mb-6">
            <TabsTrigger value="natural" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              <i className="fas fa-comments mr-2"></i>
              Natural Language
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              <i className="fas fa-edit mr-2"></i>
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="natural" className="space-y-6">
            {/* Natural Language Input */}
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-brain text-gold mr-2"></i>
                  AI-Powered Trade Entry
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Describe your trade naturally, e.g., "Bought 100 EURUSD at 1.0850 with stop at 1.0800"
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your trade in natural language..."
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold min-h-24"
                  rows={4}
                />
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={parseNaturalLanguage}
                    disabled={isParsingNatural || !naturalInput.trim()}
                    className="bg-gold text-charcoal hover:bg-gold/90"
                  >
                    {isParsingNatural ? (
                      <>
                        <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin mr-2"></div>
                        Parsing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Parse Trade
                      </>
                    )}
                  </Button>
                  
                  {naturalInput && (
                    <Button 
                      variant="outline" 
                      onClick={() => setNaturalInput("")}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Clear
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
                                <SelectItem value="" className="text-white hover:bg-white/10">No Strategy</SelectItem>
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