"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Receipt, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCcw,
  CreditCard,
  Sparkles,
  Coins
} from "lucide-react";

export default function BillingPage() {
  const purchases = useQuery(api.billing.getPurchases, {});
  const credits = useQuery(api.billing.getCredits);
  const coins = useQuery(api.billing.getMangaCoins);

  if (!purchases || !credits || !coins) {
    return (
      <Card className="p-8 glass text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </Card>
    );
  }

  const completedPurchases = purchases.filter(p => p.status === "completed");
  const totalSpent = completedPurchases.reduce((sum, p) => sum + p.price, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "refunded":
        return <RefreshCcw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      case "refunded":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-muted-foreground bg-secondary/50";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Billing & Purchases
        </h2>
        <p className="text-muted-foreground mt-1">
          View your purchase history and manage billing
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 glass">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
          <p className="text-3xl font-bold">${(totalSpent / 100).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">all time</p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Credits Balance</p>
          </div>
          <p className="text-3xl font-bold text-primary">{credits.balance}</p>
          <p className="text-sm text-muted-foreground mt-1">available credits</p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-muted-foreground">Coins Balance</p>
          </div>
          <p className="text-3xl font-bold text-amber-500">{coins.balance}</p>
          <p className="text-sm text-muted-foreground mt-1">available coins</p>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Purchases</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="coins">MangaCoins</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4">Purchase History</h3>
            
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No purchases yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase._id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${
                        purchase.type === "credits" 
                          ? "bg-primary/20" 
                          : "bg-amber-500/20"
                      }`}>
                        {purchase.type === "credits" ? (
                          <Sparkles className="h-4 w-4 text-primary" />
                        ) : (
                          <Coins className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{purchase.packageName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString()} at{" "}
                            {new Date(purchase.createdAt).toLocaleTimeString()}
                          </p>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {purchase.amount} {purchase.type === "credits" ? "credits" : "coins"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">
                          ${(purchase.price / 100).toFixed(2)}
                        </p>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {getStatusIcon(purchase.status)}
                          {purchase.status}
                        </div>
                      </div>

                      {purchase.invoiceUrl && (
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4">Credits Purchases</h3>
            
            {purchases.filter(p => p.type === "credits").length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No credit purchases yet
              </p>
            ) : (
              <div className="space-y-3">
                {purchases
                  .filter(p => p.type === "credits")
                  .map((purchase) => (
                    <div
                      key={purchase._id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{purchase.packageName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(purchase.price / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{purchase.amount} credits</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="coins">
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4">MangaCoin Purchases</h3>
            
            {purchases.filter(p => p.type === "mangacoins").length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No coin purchases yet
              </p>
            ) : (
              <div className="space-y-3">
                {purchases
                  .filter(p => p.type === "mangacoins")
                  .map((purchase) => (
                    <div
                      key={purchase._id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Coins className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">{purchase.packageName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(purchase.price / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{purchase.amount} coins</p>
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

