# User Transactions Component

## Overview

The `usersTransActions.tsx` component provides a user-specific dashboard for viewing financial transactions. It extracts user information from JWT tokens and displays only transactions belonging to the authenticated user.

## Features

### 🔐 Authentication & Security
- **JWT Token Extraction**: Automatically extracts user ID from stored JWT token
- **Token Validation**: Validates token expiry and redirects to auth if invalid
- **Access Control**: Users can only view their own transactions
- **Backend Authorization**: API endpoint validates token and user permissions

### 📊 Dashboard Summary
- **Total Income**: Sum of all income transactions
- **Total Expense**: Sum of all expense transactions  
- **Balance Calculation**: Automatic calculation of net balance
- **Transaction Count**: Total number of user transactions

### 📋 Transaction Management
- **Filtered Data**: Shows only transactions for the logged-in user
- **Search Functionality**: Search transactions by subject
- **Type Filtering**: Filter by income/expense
- **Sorting**: Sort by date, amount, type, etc.
- **Responsive Design**: Works on desktop and mobile

### 🎨 UI/UX Features
- **Luxury Design**: Gradient backgrounds and glassmorphism effects
- **Persian/Farsi Support**: Full RTL support with Persian date formatting
- **Animated Cards**: Motion animations for enhanced user experience
- **Color-coded Transactions**: Green for income, red for expenses
- **Real-time Updates**: Uses SWR for efficient data fetching

## File Structure

```
├── components/
│   ├── users/
│   │   └── usersTransActions.tsx     # Main user transactions component
│   └── global/
│       └── newdynamics/
│           └── dynamicTable.tsx      # Reusable table component
├── app/
│   ├── users/
│   │   └── transactions/
│   │       └── page.tsx              # User transactions page
│   └── api/
│       └── transactions/
│           └── route.ts              # Enhanced API with user filtering
└── types/
    └── dynamicTypes/
        └── types.ts                  # TypeScript interfaces
```

## API Enhancements

### GET /api/transactions
Enhanced to support:
- `?users=userId` - Filter transactions by user ID
- `?summary=true` - Return calculated summary data
- **Authorization Header**: Required for user-specific queries
- **Token Validation**: Verifies user can only access own data

### Example API Calls

```typescript
// Get user transactions with summary
fetch(`/api/transactions?users=${userId}&summary=true`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// Get paginated user transactions
fetch(`/api/transactions?users=${userId}&page=1&limit=10`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Integration with Dashboard

The component is integrated into the main dashboard system:

### DynamicDashboard Configuration
```typescript
const defaultUserConfig: DashboardConfig = {
  userType: "user", 
  items: [
    {
      key: "transactions",
      label: "تراکنش‌های من",
      icon: <IoCard />,
      component: UsersTransActions
    }
  ]
};
```

### User Role Access
- **Regular Users**: Can access their own transactions
- **Customers**: Can access their own transactions  
- **Coworkers**: Can access their own transactions
- **Admins**: Can access all transactions via admin panel

## Security Measures

1. **Client-Side Token Validation**: Checks token expiry before making requests
2. **Server-Side Authorization**: Validates tokens and user permissions
3. **User Isolation**: Users cannot access other users' transaction data
4. **Secure Headers**: All API calls include proper authorization headers

## Usage

### Direct Page Access
```
/users/transactions
```

### Dashboard Integration
Access via authenticated dashboard at `/dashboard` - the component will appear in the sidebar for regular users.

### Component Usage
```tsx
import UsersTransActions from "@/components/users/usersTransActions";

export default function UserTransactionsPage() {
  return <UsersTransActions />;
}
```

## Technical Details

### Token Structure
```typescript
interface DecodedToken {
  userId: string;
  phoneNumber: string;
  name: string;
  userType: "user" | "customer" | "coworker" | "admin";
  exp: number;
}
```

### Transaction Summary
```typescript
interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
```

## Error Handling

- **Invalid Token**: Redirects to `/auth` with error message
- **Expired Token**: Clears localStorage and redirects to login
- **Unauthorized Access**: Shows 403 error for cross-user access attempts
- **Network Errors**: Graceful error handling with user feedback

## Future Enhancements

1. **Export Functionality**: Add CSV/PDF export for transactions
2. **Date Range Filtering**: Advanced date range selection
3. **Transaction Categories**: Enhanced categorization system
4. **Charts & Analytics**: Visual transaction analytics
5. **Transaction Creation**: Allow users to add their own transactions