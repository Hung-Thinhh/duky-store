# Implementation Plan: Collections Page

## Tasks

- [x] 1. Create collection data and extend Product type
  - [x] 1.1 Extend Product interface with optional fields (originalPrice, badge, rating, reviewsCount, sizes, colors, gender) in `src/types/product.ts`
  - [x] 1.2 Create `src/data/collections.ts` with collection configs for boot-nam and boot-nu (hero data + product arrays)

- [x] 2. Create CollectionHero component
  - [x] 2.1 Create `src/components/shop/CollectionHero.tsx` with glassmorphism hero banner (label, title, description, image, CTAs, trust badges, social proof)

- [x] 3. Create collection layout and page
  - [x] 3.1 Create `src/app/(shop)/collections/[slug]/layout.tsx` with Header, Footer, CartDrawer, and proper spacing
  - [x] 3.2 Create `src/app/(shop)/collections/[slug]/page.tsx` with slug resolution, hero, filter sidebar, product grid, filtering logic, and empty state

- [x] 4. Export new components from barrel file
  - [x] 4.1 Add CollectionHero export to `src/components/shop/index.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] }
  ]
}
```
