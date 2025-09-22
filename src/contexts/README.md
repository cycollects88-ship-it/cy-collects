# Context Providers

This directory contains all the React Context providers for managing state across the application. Each context corresponds to a database table and provides CRUD operations and real-time updates.

## Available Contexts

### 1. AuthContext
Manages user authentication state and provides auth-related functions.

**Hook:** `useAuthContext()`

**Features:**
- User session management
- Sign up, sign in, sign out
- Password reset
- Real-time auth state updates

### 2. CartContext
Manages shopping cart state for the current user.

**Hook:** `useCartContext()`

**Features:**
- Add/remove items from cart
- Update cart quantities
- Clear entire cart
- Calculate cart totals
- Real-time cart updates

### 3. CategoryContext
Manages product categories.

**Hook:** `useCategoryContext()`

**Features:**
- CRUD operations for categories
- Toggle active/inactive status
- Get active categories
- Real-time category updates

### 4. ProductContext
Manages product data with category relationships.

**Hook:** `useProductContext()`

**Features:**
- CRUD operations for products
- Search products by name
- Filter by category or condition
- Products with category information
- Real-time product updates

### 5. ServiceContext
Manages service offerings.

**Hook:** `useServiceContext()`

**Features:**
- CRUD operations for services
- Search services by name
- Filter by price range
- Real-time service updates

### 6. UserDetailsContext
Manages user profile and role information.

**Hook:** `useUserDetailsContext()`

**Features:**
- User profile management
- Role-based access control
- Admin functions for user management
- Real-time user details updates

### 7. WantToBuyContext
Manages user's wishlist/want-to-buy items.

**Hook:** `useWantToBuyContext()`

**Features:**
- Add/remove wishlist items
- Mark items as done/pending
- Search wishlist items
- Real-time wishlist updates

## Usage Example

```tsx
import { useAuthContext, useCartContext, useProductContext } from './contexts';

function MyComponent() {
  const { user, signIn, signOut } = useAuthContext();
  const { carts, addToCart, removeFromCart } = useCartContext();
  const { products, searchProducts } = useProductContext();

  // Use the context data and functions
  const handleAddToCart = async (productId: string) => {
    await addToCart({
      product_id: productId,
      amount: 1
    });
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn('email@example.com', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

## Provider Hierarchy

The providers are nested in the following order in `App.tsx`:

```
AuthProvider
└── UserDetailsProvider
    └── CategoryProvider
        └── ProductProvider
            └── ServiceProvider
                └── CartProvider
                    └── WantToBuyProvider
                        └── AppContent
```

This hierarchy ensures that:
- Auth context is available to all other contexts
- User details are available for user-specific operations
- Categories are loaded before products (for relationships)
- All contexts have access to the authenticated user

## Real-time Updates

All contexts include real-time subscriptions to their respective database tables. When data changes in the database, the UI will automatically update without requiring a page refresh.

## Error Handling

All context functions return boolean values indicating success/failure. Errors are logged to the console for debugging purposes.

## TypeScript Support

All contexts are fully typed with TypeScript, providing excellent developer experience with autocomplete and type checking.
