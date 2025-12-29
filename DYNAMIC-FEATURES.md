# Dynamic Features Implementation Guide

This document explains the 12 newly implemented dynamic features for FAIMER.

## 📊 Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Open the file `supabase-schema.sql` and copy all contents
5. Paste and run the SQL commands
6. Verify all tables are created successfully

### Tables Created:
- `expenses` - User expense tracking
- `crop_plans` - Custom crop planning
- `activity_history` - User activity logs
- `user_profiles` - User preferences and settings
- `user_alerts` - Personalized alerts
- `labourers` - Labourer registration
- `fairfarm_products` - Marketplace products
- `fairfarm_transactions` - Transparent transactions
- `government_schemes` - Cached schemes
- `agriculture_news` - News cache

## 🚀 Features Implemented

### 1. **Expense Tracker** (`expenseService.ts`)
**Status**: ✅ Fully Dynamic

**Features**:
- Add/Edit/Delete expenses
- Categorize expenses
- Generate expense summaries
- Filter by date range
- Automatic activity logging

**Usage**:
```typescript
import { expenseService } from '@/lib/expenseService';

// Add expense
await expenseService.addExpense({
  user_id: userId,
  category: "Seeds",
  description: "Tomato seeds",
  amount: 500,
  date: "2025-12-06"
});

// Get user expenses
const expenses = await expenseService.getUserExpenses(userId);
```

### 2. **Crop Planner** (`cropPlanService.ts`)
**Status**: ✅ Fully Dynamic

**Features**:
- Save custom crop plans
- Track planting/harvest dates
- Manage crop status
- Store tasks and notes

**Usage**:
```typescript
import { cropPlanService } from '@/lib/cropPlanService';

await cropPlanService.addCropPlan({
  user_id: userId,
  crop_name: "Tomato",
  crop_type: "Vegetable",
  area_size: 2.5,
  area_unit: "acres",
  planting_date: "2025-01-15",
  status: "planning"
});
```

### 3. **Activity History** (`activityService.ts`)
**Status**: ✅ Fully Dynamic

**Features**:
- Track all user actions
- Filter by activity type
- View recent activities (7 days)
- Generate activity statistics

**Usage**:
```typescript
import { activityService } from '@/lib/activityService';

// Log activity
await activityService.logActivity(
  userId,
  "diagnosis",
  "Crop Diagnosis",
  "Diagnosed tomato blight"
);

// Get history
const history = await activityService.getUserHistory(userId);
```

### 4. **User Profile** (`profileService.ts`)
**Status**: ✅ Fully Dynamic

**Features**:
- Save user preferences
- Language settings
- Farm information
- Main crops tracking
- Location data

**Usage**:
```typescript
import { profileService } from '@/lib/profileService';

// Get or create profile
const profile = await profileService.getUserProfile(userId);

// Update language
await profileService.updateLanguage(userId, "hi");

// Update main crops
await profileService.updateMainCrops(userId, ["Rice", "Wheat"]);
```

### 5. **Personalized Alerts** (`alertService.ts`)
**Status**: ✅ Fully Dynamic with AI

**Features**:
- Weather-based alerts
- Pest risk alerts
- Irrigation reminders
- Mark as read functionality
- Auto-expire old alerts

**Usage**:
```typescript
import { alertService } from '@/lib/alertService';

// Get unread alerts
const alerts = await alertService.getUnreadAlerts(userId);

// Generate weather alert
await alertService.generateWeatherAlert(userId, weatherData, userCrops);

// Mark as read
await alertService.markAsRead(alertId);
```

### 6. **Labourer Hub** (`labourerService.ts`)
**Status**: ✅ Fully Dynamic

**Features**:
- Labourer registration
- Search by location/skills
- Availability management
- Rating system
- Verified profiles

**Usage**:
```typescript
import { labourerService } from '@/lib/labourerService';

// Register labourer
await labourerService.registerLabourer({
  user_id: userId,
  name: "Raju Kumar",
  phone: "9876543210",
  skills: ["Planting", "Harvesting"],
  location: "Maharashtra",
  wage_per_day: 500,
  availability: "available"
});

// Search labourers
const labourers = await labourerService.searchByLocation("Maharashtra");
```

### 7. **FairFarm Marketplace** (`fairFarmService.ts`)
**Status**: ✅ Fully Dynamic with Blockchain

**Features**:
- Add/Edit/Delete products
- Search by category/name
- Transaction management
- Blockchain-like hash for transparency
- Rating system

**Usage**:
```typescript
import { fairFarmService } from '@/lib/fairFarmService';

// Add product
await fairFarmService.addProduct({
  user_id: userId,
  farmer_name: "Ram Singh",
  product_name: "Organic Tomatoes",
  category: "Vegetables",
  price: 40,
  unit: "kg",
  quantity_available: 100,
  location: "Punjab",
  phone: "9876543210",
  organic: true,
  in_stock: true
});

// Create transaction
await fairFarmService.createTransaction({
  product_id: productId,
  buyer_user_id: buyerId,
  buyer_name: "Farmer John",
  seller_user_id: sellerId,
  amount: 400,
  status: "pending"
});
```

### 8. **Agriculture News** (`newsService.ts`)
**Status**: ✅ Dynamic with Caching

**Features**:
- News caching
- Category filtering
- Auto-clean old news
- Ready for RSS/API integration

**Usage**:
```typescript
import { newsService } from '@/lib/newsService';

// Get cached news
const news = await newsService.getCachedNews(10);

// Cache new news
await newsService.cacheNews({
  title: "New Crop Variety Released",
  summary: "Drought-resistant wheat variety",
  category: "Innovation",
  source: "Agricultural Ministry",
  url: "https://...",
  published_at: new Date().toISOString()
});
```

### 9. **Government Schemes** (`schemeService.ts`)
**Status**: ✅ Dynamic with AI Caching

**Features**:
- Cache AI-generated schemes
- Search functionality
- State-wise filtering
- Category filtering
- Auto-refresh detection

**Usage**:
```typescript
import { schemeService } from '@/lib/schemeService';

// Cache scheme
await schemeService.cacheScheme({
  scheme_name: "PM-KISAN",
  category: "Financial Support",
  description: "Direct income support",
  eligibility: "Small farmers",
  benefits: "₹6000 per year",
  how_to_apply: "Visit pmkisan.gov.in",
  state: "All India",
  source: "Central Government",
  last_updated: new Date().toISOString()
});

// Search schemes
const schemes = await schemeService.searchSchemes("kisan");
```

### 10. **Market Prices** 
**Status**: ✅ Already Dynamic (Needs Enhancement)

**Current**: Fetches real-time prices via Gemini AI
**Enhancement**: Add caching and better error handling

### 11. **Weather Alerts**
**Status**: ✅ Already Dynamic (Needs Enhancement)

**Current**: Fetches weather data
**Enhancement**: Integrate with `alertService` for personalized alerts

### 12. **Farmer Forum**
**Status**: ✅ Already Dynamic

**Current**: Using Supabase with real-time updates
**Enhancement**: Working perfectly

## 🔧 Integration Steps

### Step 1: Update Component Imports

In each component, replace static data with service calls:

```typescript
// OLD (Static)
const expenses = [{ id: 1, amount: 500 }];

// NEW (Dynamic)
import { expenseService } from '@/lib/expenseService';
import { useAuth } from '@/contexts/AuthContext';

const { firebaseUser } = useAuth();
const [expenses, setExpenses] = useState([]);

useEffect(() => {
  if (firebaseUser) {
    expenseService.getUserExpenses(firebaseUser.uid)
      .then(setExpenses);
  }
}, [firebaseUser]);
```

### Step 2: Add Loading States

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    setLoading(true);
    const data = await expenseService.getUserExpenses(userId);
    setExpenses(data);
    setLoading(false);
  }
  loadData();
}, [userId]);
```

### Step 3: Handle Errors

```typescript
try {
  await expenseService.addExpense(newExpense);
  toast({ title: "Success", description: "Expense added" });
} catch (error) {
  toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
}
```

## 📱 Testing

1. **Expense Tracker**: Add, edit, delete expenses
2. **Crop Planner**: Create custom crop plans
3. **History**: Check activity logs
4. **Profile**: Update language and preferences
5. **Alerts**: Generate and view personalized alerts
6. **Labourers**: Register and search labourers
7. **FairFarm**: Add products and create transactions
8. **News**: Cache and retrieve news
9. **Schemes**: Cache and search schemes

## 🎯 Priority Implementation Order

1. ✅ **Profile Service** - Base for all features
2. ✅ **Activity Service** - Track everything
3. ✅ **Expense Tracker** - Show data persistence
4. ✅ **Crop Planner** - Core farming feature
5. ✅ **Alerts** - Personalization demo
6. ✅ **Labourer Hub** - Community feature
7. ✅ **FairFarm** - Blockchain transparency
8. ✅ **News & Schemes** - Content management

## 🚨 Important Notes

1. **RLS Policies**: All tables have Row Level Security enabled
2. **User Authentication**: Must use Firebase UID as user_id
3. **Blockchain Hashes**: Simple implementation for demo purposes
4. **News API**: Placeholder - integrate actual API later
5. **Caching**: Schemes and news are cached to reduce API calls

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public read for marketplace and labourers
- Verified profiles for trust

## 📊 Next Steps

1. Integrate services into existing components
2. Add error handling and loading states
3. Test all CRUD operations
4. Add data validation
5. Implement offline support with local caching
6. Add analytics and insights

All services are ready to use! Just import and call the functions. 🎉
