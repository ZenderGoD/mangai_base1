# Billing & Currency System

The platform now features a **dual-currency system** for monetization:

## 💰 Two Types of Currency

### 1. ⚡ **Credits** - AI Generation Currency
**Purpose:** Used for creating AI-generated manga content

**Use Cases:**
- Generate story chapters (5 credits/chapter)
- Generate panel images (1 credit/panel)
- Edit images with AI (1 credit/edit)

**Features:**
- Never expire
- Welcome bonus: 100 credits for new users
- Purchase packages with bonus credits
- Track all generation expenses

### 2. 🪙 **MangaCoins** - Content Access Currency
**Purpose:** Used for reading exclusive manga content

**Use Cases:**
- Unlock exclusive chapters (10-50 coins/chapter)
- Access premium stories
- Early access to new content
- Permanent access once unlocked

**Features:**
- Never expire
- Welcome bonus: 50 coins for new users
- Creators earn 70% of coins spent on their content
- Can be earned or purchased

---

## 📊 Dashboard Pages

### 1. Credits Page (`/dashboard/credits`)

**Overview Section:**
- Current balance display
- Total earned (all time)
- Total spent (generations)

**Buy Credits Tab:**
- How Credits Work info card
- Pricing packages with:
  - Package name & description
  - Credit amount + bonus
  - Price in USD
  - "MOST POPULAR" badge for featured packages
  - Discount percentage display
- One-click purchase

**Transaction History Tab:**
- Recent credit transactions
- Type indicators (purchase, spent, bonus, refund)
- Balance tracking
- Timestamps

### 2. MangaCoins Page (`/dashboard/mangacoins`)

**Overview Section:**
- Current coin balance
- Total earned
- Total spent (chapters read)

**Buy Coins Tab:**
- How MangaCoins Work info card
- Pricing packages with:
  - Coin amount + bonus
  - "BEST VALUE" badge
  - Amber-themed design
- Creator earning info (70% revenue share)

**Transaction History Tab:**
- Recent coin transactions
- Types: purchase, spent, earned, bonus, refund
- Balance tracking

### 3. Billing Page (`/dashboard/billing`)

**Summary Cards:**
- Total spent (all time in USD)
- Current credits balance
- Current coins balance

**Purchase History:**
- All Purchases tab (both credits & coins)
- Credits-only filter
- MangaCoins-only filter

**Purchase Details:**
- Package name
- Amount purchased
- Price paid
- Status (completed, pending, failed, refunded)
- Purchase date/time
- Invoice download (when available)

---

## 🗄️ Database Schema

### New Tables Added:

#### `credits`
- userId
- balance (current)
- totalEarned
- totalSpent
- lastUpdated

#### `mangaCoins`
- userId
- balance (current)
- totalEarned
- totalSpent
- lastUpdated

#### `creditTransactions`
- userId
- type (purchase, spent, bonus, refund)
- amount
- balanceBefore/After
- description
- metadata (generationId, purchaseId, packageId)
- createdAt

#### `coinTransactions`
- userId
- type (purchase, spent, earned, bonus, refund)
- amount
- balanceBefore/After
- description
- metadata (storyId, chapterId, purchaseId, packageId)
- createdAt

#### `purchases`
- userId
- type (credits or mangacoins)
- packageId & packageName
- amount purchased
- price & currency
- status (pending, completed, failed, refunded)
- paymentMethod & paymentProvider
- transactionId
- invoiceUrl
- createdAt & completedAt

#### `packages`
- type (credits or mangacoins)
- name & description
- amount (base amount)
- bonus (extra amount)
- price & currency
- popular (featured flag)
- discount (percentage)
- active (availability)
- displayOrder
- createdAt

---

## 🔧 Convex Functions

### Queries:
- `getCredits()` - Get user's credit balance
- `getMangaCoins()` - Get user's coin balance
- `getCreditTransactions(limit)` - Get credit history
- `getCoinTransactions(limit)` - Get coin history
- `getPurchases(status?)` - Get purchase history
- `getPackages(type)` - Get available packages

### Mutations:
- `initializeWallet()` - Set up new user with welcome bonuses
- `purchasePackage(packageId)` - Buy credits or coins

---

## 💳 Purchase Flow

1. User views pricing packages
2. Clicks "Purchase" button
3. `purchasePackage` mutation creates:
   - Purchase record (with status)
   - Transaction record
   - Updates balance
4. Toast notification confirms success
5. Balance updates immediately
6. Transaction appears in history

**Note:** Currently using demo mode. In production, integrate with payment provider (Stripe, PayPal, etc.)

---

## 🎁 Welcome Bonuses

New users automatically receive:
- **100 Credits** for AI generation
- **50 MangaCoins** for reading

Triggered by `initializeWallet()` mutation on first use.

---

## 💸 Creator Economy

**Revenue Share Model:**
- Readers spend MangaCoins on exclusive content
- Creators earn **70% of coins** spent
- Earned coins can be:
  - Withdrawn (future feature)
  - Used to read other creators' content

**Transaction Types:**
- `spent` - Reader unlocks content
- `earned` - Creator receives payment
- `purchase` - User buys coins
- `bonus` - Free coins from platform

---

## 🎨 UI/UX Features

- **Color Coding:**
  - Credits: Purple/Pink/Amber gradient
  - MangaCoins: Amber/Orange/Yellow gradient
  
- **Visual Indicators:**
  - Popular/Best Value badges
  - Bonus amount highlights
  - Discount percentages
  - Status icons (completed ✓, pending ⏱️, failed ✗, refunded ↻)

- **Real-time Updates:**
  - Balance updates on purchase
  - Transaction history refreshes
  - Toast notifications

- **Mobile Responsive:**
  - Adaptive grid layouts
  - Touch-friendly buttons
  - Readable on all screen sizes

---

## 📍 Navigation

Access from Dashboard sidebar:
- Credits (⚡ icon)
- MangaCoins (🪙 icon)
- Billing (📝 icon)

Also visible:
- Profile (public creator profile)
- Comic Board (story management)
- Settings (account preferences)

---

## ✅ Build Status

- **Routes**: 23 total (+3 new billing pages)
- **Build**: ✅ Successful
- **TypeScript**: ✅ Type-safe (with necessary assertions)
- **Warnings**: Only minor unused variables (non-critical)

---

## 🚀 Future Enhancements

1. **Payment Integration:**
   - Stripe checkout
   - PayPal support
   - Cryptocurrency payments

2. **Pricing Features:**
   - Subscription plans
   - Bundle deals
   - Seasonal discounts
   - Referral bonuses

3. **Creator Tools:**
   - Withdraw earnings
   - Set coin prices for content
   - Revenue analytics
   - Monthly payouts

4. **User Features:**
   - Gift credits/coins
   - Credit sharing
   - Loyalty rewards
   - Achievement bonuses

5. **Admin Tools:**
   - Package management UI
   - Transaction monitoring
   - Refund processing
   - Fraud detection

