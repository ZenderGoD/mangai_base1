"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, TrendingDown, BookOpen, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function MangaCoinsPage() {
  const coins = useQuery(api.billing.getMangaCoins);
  const packages = useQuery(api.billing.getPackages, { type: "mangacoins" });
  const transactions = useQuery(api.billing.getCoinTransactions, { limit: 20 });
  const purchasePackage = useMutation(api.billing.purchasePackage);
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      await purchasePackage({ packageId: packageId as Id<"packages"> });
      toast({
        title: "Purchase Successful!",
        description: "MangaCoins have been added to your account.",
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (!coins) {
    return (
      <Card className="p-8 glass text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            MangaCoins
          </h2>
          <p className="text-muted-foreground mt-1">
            Use MangaCoins to unlock and read exclusive manga content
          </p>
        </div>
      </div>

      {/* Balance Overview */}
      <Card className="p-6 glass border-2 border-amber-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              {coins.balance}
            </p>
            <p className="text-sm text-muted-foreground mt-1">coins</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-2">Total Earned</p>
            <p className="text-2xl font-bold text-green-500">{coins.totalEarned}</p>
            <p className="text-sm text-muted-foreground mt-1">all time</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
            <p className="text-2xl font-bold text-blue-500">{coins.totalSpent}</p>
            <p className="text-sm text-muted-foreground mt-1">chapters read</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buy">Buy Coins</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-6">
          {/* Coin Usage Info */}
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              How MangaCoins Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-amber-500">•</div>
                <div>
                  <p className="font-medium">Exclusive Chapters</p>
                  <p className="text-muted-foreground">10-50 coins per chapter</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-amber-500">•</div>
                <div>
                  <p className="font-medium">Premium Stories</p>
                  <p className="text-muted-foreground">Unlock full series</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-amber-500">•</div>
                <div>
                  <p className="font-medium">Early Access</p>
                  <p className="text-muted-foreground">Read before public release</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-amber-500">•</div>
                <div>
                  <p className="font-medium">Permanent Access</p>
                  <p className="text-muted-foreground">Once unlocked, yours forever</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <Card
                key={pkg._id}
                className={`p-6 glass relative ${
                  pkg.popular ? "border-2 border-amber-500" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    BEST VALUE
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                  
                  <div className="text-4xl font-bold mb-2 text-amber-500">
                    {pkg.amount + (pkg.bonus || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">coins</p>
                  
                  {pkg.bonus && pkg.bonus > 0 && (
                    <div className="mt-2 inline-block bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold">
                      +{pkg.bonus} BONUS
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${(pkg.price / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">{pkg.currency}</span>
                  </div>
                  {pkg.discount && pkg.discount > 0 && (
                    <p className="text-center text-sm text-amber-500 mt-1">
                      Save {pkg.discount}%
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handlePurchase(pkg._id)}
                  disabled={purchasing === pkg._id}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {purchasing === pkg._id ? "Processing..." : "Purchase"}
                </Button>
              </Card>
            ))}
          </div>

          {/* Creator Earning Info */}
          <Card className="p-6 glass bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-amber-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">For Creators</h3>
                <p className="text-sm text-muted-foreground">
                  When readers spend coins on your exclusive content, you earn 70% of the coins. 
                  You can withdraw your earnings or use them to read other creators&apos; content!
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4">Recent Transactions</h3>
            
            {!transactions || transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "purchase" || 
                          transaction.type === "bonus" || 
                          transaction.type === "earned"
                            ? "bg-amber-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {transaction.type === "purchase" || 
                         transaction.type === "bonus" || 
                         transaction.type === "earned" ? (
                          <TrendingUp className="h-4 w-4 text-amber-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.amount > 0 ? "text-amber-500" : "text-blue-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

