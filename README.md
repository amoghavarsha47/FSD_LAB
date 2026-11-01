# BMS Loop — Campus Marketplace Frontend

A responsive React + Vite frontend for a BMSCE-only campus marketplace. It is designed as a first-submission project: key user flows are interactive, while backend-dependent features are clearly identified as demos.

## Requirements

- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm

## Run locally

1. Extract this project folder.
2. Open a terminal inside `bms-loop`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

<!-- Create a production build with:

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview -->
```

## Demo walkthrough

1. Enter an email ending in `@bmsce.ac.in`, for example `student@bmsce.ac.in`.
2. The demo moves to a verification-code screen. Use **246810**.
3. Browse listings, search, filter by category/condition/price, sort, save items, and open product details.
4. Use **Sell an item** to create a listing. New listings start as **Pending Review**.
5. Open **Moderation** and approve or reject the listing.
6. Open a product and make an offer. Offers are saved locally and the product is marked **Under Agreement** in this demo.
7. Open **Transactions**, then confirm a demo handover using OTP **135790**.
8. Use **Demo controls** (bottom-right) to reset sample data or sign out.

## Frontend functionality included

- Domain-format gate for `@bmsce.ac.in` and demo OTP verification.
- Responsive marketplace, product detail modal, category filters, search, sort, and saved items.
- Sell form with validation, category deposit display, image URL support, and a rule-based category suggestion demo.
- Student activity dashboard and local privacy preference toggles.
- Offer creation, transaction fee breakdown, agreement and handover demo states.
- Admin moderation queue with approve/reject actions.
- Browser-local persistence via `localStorage`.

## Explicit demo limitations

This is **not** production authentication or a secure marketplace backend.

- The email check verifies the domain format only. The demo OTP is shown in the UI and is not emailed. It does not prove control of the mailbox.
- User identity, listing data, offers, privacy preferences, and moderation states are stored in the current browser. They are not shared with other users or devices.
- The admin screen is not access-controlled. It is a workflow demonstration, not a secure administrator portal.
- Category classification is a small keyword-based demo function, not an AI model/API.
- The image field accepts a direct image URL; there is no file upload service.
- No money is collected. Listing deposits, buyer/seller platform fees, and escrow are illustrative UI calculations only.
- Handover OTP `135790` is a fixed demo value. It does not release funds or verify a real-world handover.
- Product photos are remote Unsplash image URLs and require an internet connection. Replace them with approved local assets if needed for an offline demo.

## Suggested next phase

When a backend is in scope, add server-side email verification, authenticated sessions and roles, database-backed listings/offers, secure image uploads, a real AI moderation/classification API, payment provider integration, escrow/settlement logic, server-generated one-time handover codes, and audit logs. Never treat frontend-only checks as authorization or payment security.

## Structure

```text
src/
  App.jsx       Main screens and frontend interactions
  data.js       Demo listings, category deposits, INR formatter, category suggestion
  main.jsx      React entry point
  styles.css    Design tokens, component styling, and responsive breakpoints
```

## Notes

- All displayed prices use Indian rupees (INR).
- Deposit examples are editable in `src/data.js` under `categoryDeposits`.
- Demo fee percentages are editable in `src/data.js` under `demoFees`.
- Product sample data can be edited in `src/data.js`.
