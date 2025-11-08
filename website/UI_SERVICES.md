# Service Marketplace UI - Frontend Documentation

## Overview

The Service Marketplace frontend is a React/Next.js application that provides a Fiverr-style interface for browsing, purchasing, and managing services. It integrates with the ServiceMarketplaceV1 smart contracts via wagmi/viem and queries indexed data from a Subsquid GraphQL endpoint.

---

## Architecture

### Tech Stack
```
Next.js 14 (App Router)
    ├─ React 18
    ├─ TypeScript
    ├─ Tailwind CSS
    └─ Server + Client Components

Web3 Integration
    ├─ wagmi (React Hooks for Ethereum)
    ├─ viem (Ethereum utilities)
    └─ RainbowKit (Wallet connection)

Data Layer
    ├─ Apollo Client (GraphQL)
    ├─ Subsquid Indexer (Event indexing)
    └─ IPFS (Content storage)

State Management
    └─ React hooks + URL state
```

---

## File Structure

```
website/src/
├── app/
│   └── services/
│       ├── page.tsx                      # Browse services page (server)
│       └── [id]/
│           ├── page.tsx                  # Service detail (server) [TODO]
│           └── ServicePageClient.tsx     # Service detail (client) [TODO]
│
├── components/
│   └── Services/
│       ├── ServiceCard.tsx               # Grid item component ✓
│       ├── ServiceFilter.tsx             # Search/filter UI ✓
│       ├── ServiceFeed.tsx               # Browse page logic ✓
│       ├── ServiceSidebar.tsx            # Purchase form [TODO]
│       └── ServiceDescription.tsx        # Service details [TODO]
│
├── hooks/
│   └── subsquid/
│       ├── useService.tsx                # Fetch single service ✓
│       ├── useServiceSearch.tsx          # Search/filter services ✓
│       ├── useServiceOrder.tsx           # Fetch order details ✓
│       ├── useServiceOrdersByBuyer.tsx   # Buyer's orders ✓
│       ├── useServiceOrderEvents.tsx     # Order timeline ✓
│       ├── queries.ts                    # GraphQL queries ✓
│       └── fields.ts                     # GraphQL fragments ✓
│
└── contracts/
    └── [symlink to ../../../contract/]
        ├── wagmi/ServiceMarketplaceV1.ts    # Contract ABI ✓
        └── wagmi/ServiceMarketplaceDataV1.ts # Data ABI ✓
```

---

## Components

### 1. ServiceCard.tsx ✓
**Location:** `components/Services/ServiceCard.tsx` (260 lines)

**Purpose:** Display service in grid layout

**Props:**
```typescript
interface ServiceCardProps {
  service: Service;
}
```

**Features:**
- 🎨 Glassmorphism design with backdrop blur
- ⭐ Star rating display (converts from scaled rating)
- 👤 Seller profile with avatar
- 💰 Price display with token icon
- ⏱️ Delivery time indicator
- 📊 Order statistics (completed orders)
- 🔄 Service state badges (Available/Paused)
- ✨ Hover animations (shimmer, gradient border)
- 🏷️ Tag badges with glass effect
- 🌙 Dark mode support

**Visual Design:**
- Green accent color (vs blue for jobs)
- Service status indicator bar (left edge)
- Animated gradient on hover
- Responsive grid layout

**Example Usage:**
```tsx
<ServiceCard service={serviceData} />
```

---

### 2. ServiceFilter.tsx ✓
**Location:** `components/Services/ServiceFilter.tsx` (420 lines)

**Purpose:** Search and filter services

**Props:**
```typescript
interface ServiceFilterProps {
  search: string;
  setSearch: (value: string) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  selectedToken: Token | undefined;
  setSelectedToken: (token: Token | undefined) => void;
  minPrice: number | undefined;
  setMinPrice: (price: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (price: number | undefined) => void;
  minRating: number | undefined;
  setMinRating: (rating: number | undefined) => void;
  sellerAddress: string | undefined;
  setSellerAddress: (address: string | undefined) => void;
  serviceState: number | undefined;
  setServiceState: (state: number | undefined) => void;
}
```

**Filter Options:**
1. **Search Bar**
   - Full-text search (title/description)
   - Keyboard shortcut: ⌘K / Ctrl+K
   - Real-time URL sync

2. **Advanced Filters (Collapsible)**
   - **Tags:** Multi-select with TagsInput
   - **Token & Price:** Token dropdown + min/max range
   - **Minimum Rating:** Dropdown (Any / 4+ / 4.5+)
   - **Service Status:** All / Active / Paused
   - **Seller Address:** Text input for specific seller

**Features:**
- Auto-expand if filters active from URL
- Individual "Clear" buttons per section
- Active filter count badge
- Green accent theme
- Glassmorphism design
- Responsive layout

**Example Usage:**
```tsx
<ServiceFilter
  search={search}
  setSearch={setSearch}
  tags={tags}
  setTags={setTags}
  // ... other props
/>
```

---

### 3. ServiceFeed.tsx ✓
**Location:** `components/Services/ServiceFeed.tsx` (340 lines)

**Purpose:** Main browse services logic

**Features:**
- 📋 **Grid Layout:** 3 cols desktop, 2 tablet, 1 mobile
- ♾️ **Infinite Scroll:** IntersectionObserver pattern
- 🔄 **Real-time Updates:** "New services" notification button
- 🔗 **URL State:** All filters persist in URL
- 💀 **Loading Skeletons:** Animated placeholders
- 🚫 **Empty State:** Helpful message when no results
- ⚠️ **Error Handling:** User-friendly error display

**Data Flow:**
```
ServiceFeed
    ├─ useServiceSearch (existing services)
    ├─ useServiceSearch (new services since load)
    ├─ URL params → Filter state
    └─ Filter state → URL params (sync)
```

**Infinite Scroll Pattern:**
```typescript
const [limit, setLimit] = useState(20);

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setLimit(prev => prev + 10); // Load more
    }
  });
  observer.observe(loadMoreRef.current);
}, []);
```

**Example Usage:**
```tsx
export default function ServicesPage() {
  return (
    <Layout>
      <ServiceFeed />
    </Layout>
  );
}
```

---

## Pages

### Browse Services Page ✓
**Route:** `/services`
**Files:** `app/services/page.tsx` (50 lines)

**Features:**
- ✅ SEO-optimized metadata
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ Page header with title
- ✅ ServiceFeed component
- ✅ Layout wrapper (nav/footer)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Browse Services',
  description: 'Browse and purchase professional services...',
  openGraph: { /* social sharing */ },
  twitter: { /* twitter card */ },
};
```

---

## Data Layer

### GraphQL Queries ✓

**Location:** `hooks/subsquid/queries.ts`

**Service Queries:**
```graphql
GET_SERVICE_BY_ID
GET_SERVICES
GET_ACTIVE_SERVICES
GET_SERVICES_BY_SELLER
GET_SERVICE_SEARCH (dynamic)

GET_SERVICE_ORDER_BY_ID
GET_SERVICE_ORDERS_BY_BUYER
GET_SERVICE_ORDERS_BY_SELLER
GET_SERVICE_ORDERS_BY_SERVICE

GET_SERVICE_EVENTS
GET_SERVICE_ORDER_EVENTS
GET_SERVICE_REVIEWS
```

**Example:**
```typescript
const GET_ACTIVE_SERVICES = gql`
  query GetActiveServices($offset: Int!, $limit: Int!) {
    services(
      orderBy: timestamp_DESC,
      offset: $offset,
      limit: $limit,
      where: { state_eq: 0 }
    ) {
      ${ServiceFields}
    }
  }
`;
```

---

### GraphQL Fields ✓

**Location:** `hooks/subsquid/fields.ts`

**Service Fields:**
```graphql
ServiceFields: id, seller, title, tags, price, rating, etc.
ServiceOrderFields: orderId, buyer, seller, state, price, etc.
ServiceReviewFields: rating, review text, timestamp
ServiceEventFields: type, timestamp, details (union type)
```

**Event Union Types:**
- ServiceCreatedEvent
- ServiceUpdatedEvent
- ServicePausedEvent
- OrderCreatedEvent
- OrderDeliveredEvent
- OrderCompletedEvent
- OrderMessageEvent
- ... and more (13 total)

---

### Custom Hooks ✓

#### useService(id: string)
Fetch single service by ID.

```typescript
const { data: service, loading, error } = useService('123');
```

**Returns:**
```typescript
{
  data: Service | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}
```

#### useServiceSearch(params)
Search and filter services.

```typescript
const { data: services } = useServiceSearch({
  serviceSearch: {
    title: 'design',
    tags: ['DA', 'logo'],
    state: 0, // Active
    price_gte: parseUnits('100', 18),
    averageRating_gte: 40000,
  },
  orderBy: 'timestamp_DESC',
  limit: 20,
  offset: 0,
});
```

**Search Operators:**
- `field_eq`: Equals
- `field_gte`: Greater than or equal
- `field_lte`: Less than or equal
- `field_containsInsensitive`: Text search
- `field_containsAny`: Array contains
- `field_containsNone`: Array excludes

#### useServiceOrder(id: string)
Fetch order details.

```typescript
const { data: order } = useServiceOrder('456');
```

#### useServiceOrderEvents(orderId: bigint)
Fetch order event timeline.

```typescript
const { data: events } = useServiceOrderEvents(456n);
```

---

## Type Definitions

### Service
```typescript
interface Service {
  id: string;
  seller: string;
  title: string;
  descriptionHash: string;
  description: string;
  tags: string[];
  paymentToken: string;
  price: bigint;
  deliveryTime: number;        // seconds
  deliveryMethod: string;
  arbitrator: string;
  state: number;               // 0=Active, 1=Paused, 2=Deleted
  totalOrders: number;
  completedOrders: number;
  averageRating: number;       // scaled by 10000
  numberOfRatings: number;
  timestamp: number;
  updatedAt: number;
}
```

### ServiceOrder
```typescript
interface ServiceOrder {
  id: string;
  serviceId: bigint;
  buyer: string;
  seller: string;
  roles: {
    buyer: string;
    seller: string;
  };
  price: bigint;
  paymentToken: string;
  escrowId: bigint;
  state: number;               // 0-6 (OrderState enum)
  requirementsHash: string;
  requirements: string;
  resultHash: string;
  result: string;
  disputed: boolean;
  createdAt: number;
  deliveredAt: number;
  completedAt: number;
  eventCount: number;
}
```

### Enums
```typescript
enum ServiceState {
  Active = 0,
  Paused = 1,
  Deleted = 2,
}

enum OrderState {
  Pending = 0,
  InProgress = 1,
  Delivered = 2,
  Completed = 3,
  Disputed = 4,
  Refunded = 5,
  Cancelled = 6,
}
```

---

## Design System

### Color Theme
- **Primary:** Green (vs Blue for jobs)
  - `green-400`, `green-500`, `emerald-400`, `emerald-500`
- **Accent:** Green gradient
  - `from-green-400 to-emerald-400`
- **Status:**
  - Active: Green
  - Paused: Gray
  - Rating: Yellow (`yellow-400`)

### Visual Effects
- **Glassmorphism:** `backdrop-blur-sm`, `bg-white/50`
- **Hover animations:** Transform, shimmer, gradient borders
- **Transitions:** `duration-300`, `ease-out`
- **Shadows:** `shadow-lg`, `shadow-green-500/10`

### Icons
Uses `lucide-react`:
- `ShoppingCart` - Available service
- `Pause` - Paused service
- `Star` - Ratings
- `Clock` - Delivery time
- `Cloud`, `LinkIcon`, `Package` - Delivery methods
- `Sparkles` - New services notification

---

## URL State Management

### Pattern
All filter state syncs to URL for shareable links.

**Example URL:**
```
/services?search=logo&tags=design&tags=branding&token=0x...&minPrice=100&minRating=40000&state=0
```

**Implementation:**
```typescript
useEffect(() => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (selectedToken) params.set('token', selectedToken.id);
  tags.forEach(tag => params.append('tags', tag.name));
  // ... more params

  router.replace(`?${params.toString()}`, { scroll: false });
}, [search, tags, selectedToken, /* ... */]);
```

**Benefits:**
- Shareable filtered views
- Browser back/forward works
- Bookmark specific searches
- Deep linking support

---

## Integration Points

### Smart Contracts
```typescript
import { SERVICE_MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/ServiceMarketplaceV1';
import { useReadContract, useWriteContract } from 'wagmi';

// Read
const { data } = useReadContract({
  address: config.serviceMarketplaceAddress,
  abi: SERVICE_MARKETPLACE_V1_ABI,
  functionName: 'getService',
  args: [serviceId],
});

// Write
const { writeContract } = useWriteContract();
await writeContract({
  address: config.serviceMarketplaceAddress,
  abi: SERVICE_MARKETPLACE_V1_ABI,
  functionName: 'purchaseService',
  args: [serviceId, requirementsHash],
});
```

### GraphQL/Subsquid
```typescript
import { useQuery } from '@apollo/client';
import { GET_SERVICE_BY_ID } from '@/hooks/subsquid/queries';

const { data } = useQuery(GET_SERVICE_BY_ID, {
  variables: { serviceId: '123' },
});
```

### IPFS
```typescript
// Service descriptions, requirements, and results stored on IPFS
const descriptionHash = 'QmXxx...'; // Stored in service.descriptionHash
const content = await ipfs.get(descriptionHash);
```

---

## TODO: Upcoming Features

### Service Detail Page
**Route:** `/services/[id]`
**Status:** ⏳ Pending

**Features Needed:**
- Server component for SEO
- Client component for interactivity
- Full service description (IPFS)
- Seller profile section
- Reviews section with pagination
- Purchase sidebar
- Related services

### Service Sidebar
**Component:** `ServiceSidebar.tsx`
**Status:** ⏳ Pending

**Features Needed:**
- Service stats display
- Purchase form
- Requirements textarea
- Token approval check
- Purchase button
- State indicators

### Order Detail Page
**Route:** `/orders/[id]`
**Status:** ⏳ Pending

**Features Needed:**
- Order timeline (events)
- Buyer/seller messaging
- Delivery upload/download
- Approve/dispute actions
- Rating/review form

### Navigation Updates
**Files:** `components/Layout/Navbar.tsx`
**Status:** ⏳ Pending

**Changes Needed:**
- Add "Services" link to main nav
- Dropdown: Browse Services | My Orders
- Active state for `/services/*` routes

---

## Testing

### Current Status
- ✅ Components built and render
- ✅ Filters work and sync to URL
- ✅ Hooks defined and typed
- ⚠️ No data (Subsquid processor not updated)
- ⏳ Contract integration not tested

### Testing Guide
See `TESTING_SERVICES.md` for comprehensive testing instructions.

**Quick Test:**
```bash
cd website
npm run dev
# Visit: http://localhost:3000/services
```

**What Works:**
- Page loads
- Filters UI functional
- URL state management
- Responsive design
- Dark mode

**What Needs Data:**
- Service cards display
- Infinite scroll
- Real-time updates
- Clickthrough to details

---

## Performance Optimizations

### Implemented
- ✅ Infinite scroll (load 20, +10 on scroll)
- ✅ Intersection Observer for lazy loading
- ✅ React.memo on expensive components
- ✅ URL state (no Redux needed)
- ✅ GraphQL query caching (Apollo)
- ✅ Skeleton loaders for perceived performance

### Planned
- ⏳ Image optimization (next/image)
- ⏳ Virtual scrolling for huge lists
- ⏳ Service data prefetching
- ⏳ Static generation for popular services

---

## Accessibility

### Current Features
- ✅ Semantic HTML
- ✅ Keyboard navigation (⌘K search)
- ✅ Focus indicators
- ✅ ARIA labels on interactive elements
- ✅ Color contrast (WCAG AA)

### TODO
- ⏳ Screen reader testing
- ⏳ Alt text for all images
- ⏳ Skip links
- ⏳ Reduced motion support

---

## Browser Support

**Tested:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Requirements:**
- Modern browser with ES2020 support
- Web3 wallet (MetaMask, WalletConnect)
- JavaScript enabled

---

## Troubleshooting

### "No Services Found"
**Cause:** Subsquid processor not indexing service events
**Solution:** Update processor or add mock data

### Filters not working
**Check:** Console for GraphQL errors
**Verify:** Subsquid endpoint is running

### Service cards not rendering
**Check:** Data structure matches Service interface
**Verify:** GraphQL query returns expected shape

### Purchase button does nothing
**Cause:** Contract integration not complete
**Status:** ServiceSidebar component not built yet

---

## Contributing

### Adding New Filters
1. Add state in `ServiceFeed.tsx`
2. Add filter UI in `ServiceFilter.tsx`
3. Sync to URL in `useEffect`
4. Update GraphQL search query

### Adding Service Actions
1. Import contract ABI
2. Use `useWriteContract` hook
3. Handle transaction states
4. Show user feedback (toasts)
5. Refresh data after confirmation

---

## Resources

**Documentation:**
- Contract Docs: `contract/CONTRACT_SERVICES.md`
- Testing Guide: `TESTING_SERVICES.md`
- Integration Guide: `contract/SERVICE_MARKETPLACE_FRONTEND_INTEGRATION.md`

**Code References:**
- Job components: `components/Dashboard/JobsList/`
- Similar patterns to follow

**External:**
- wagmi docs: https://wagmi.sh
- Apollo Client: https://apollographql.com/docs/react
- Subsquid: https://docs.subsquid.io

---

## Changelog

**v0.1.0** (Current - MVP Partial)
- ✅ Browse services page
- ✅ Service card component
- ✅ Filter UI with 7+ options
- ✅ Infinite scroll
- ✅ URL state management
- ✅ GraphQL queries & hooks
- ⏳ Service detail page (TODO)
- ⏳ Purchase flow (TODO)
- ⏳ Order management (TODO)

---

## License

MIT License - See LICENSE file
