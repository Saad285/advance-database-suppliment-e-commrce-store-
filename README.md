# IronRoots Supplements e-Commerce Store 🌿

A premium, database-driven e-Commerce store built with **Next.js**, **TailwindCSS**, and **Supabase (PostgreSQL)**, specifically engineered to showcase advanced database concepts, high-fidelity responsive design, and robust security architecture.

Developed as a semester project for the **Advanced Database Systems (ADB)** course.

---

## 🌟 Advanced Database Systems (ADB) Rubrics Implemented

This project fully satisfies and implements the following advanced database criteria:

### 1. Database Design & Normalization (3NF)
* Core entities normalized perfectly into **3rd Normal Form (3NF)**:
  * `categories`, `products`, `profiles`, `addresses`, `orders`, `order_items`, `settings`, `audit_log`.
* All relationships are strictly configured with standard `FOREIGN KEY` constraints and referential actions (e.g. `ON DELETE CASCADE`, `ON DELETE SET NULL`).
* Utilizes **UUIDs** generated dynamically using Postgres' cryptographically secure `gen_random_uuid()` instead of predictable incremental IDs.

### 2. Triggers & Stored Procedures (Business Logic Automation)
* **Automated Signups Trigger:** Binds to Supabase's `auth.users` to automatically call `handle_new_user()` and populate the public `profiles` table with default roles when a new customer registers.
* **Order Audit Logging Trigger:** Listens to `orders` modifications, automatically capturing order state mutations (`STATUS_UPDATE`) and writing the changes to the `audit_log` with JSON state structures.

### 3. ACID Compliance, Concurrency, and Stored Functions
* Handles checkout operations via an atomic database function **`place_order(order_data JSONB, items_data JSONB)`**.
* **Automatic Stock Management:** Safely decrements product inventory. 
* **Concurrency Protection & Rollback:** The function performs safe stock checks before updating. If a race condition occurs or stock falls below the requested quantity, the query raises an exception and PostgreSQL **rolls back the entire transaction**, ensuring database integrity.

### 4. Indexing & Query Performance Tuning
* Indexes applied strategically to scale lookups:
  * `idx_products_category`, `idx_orders_user`, `idx_order_items_order` to optimize dynamic query joins.
  * **Partial Indexes** (`idx_products_active`, `idx_products_featured`) for highly filtered catalog landing views.
  * **GIN Indexing** (`idx_products_attributes`) to enable ultra-fast key-value searching inside the `JSONB` product attributes column.

### 5. Access Control (Row Level Security & Grants)
* **Row Level Security (RLS)** enabled across all core tables to enforce isolated access.
* Specific granular policies written for:
  * Customers (`profiles_self`, `orders_self`, `addr_self`, `items_self`) to read/write only their own records.
  * Anonymous Users (`products_public_read`, `categories_public`) to browse active products without authorization.
  * Admins (`products_admin`, `categories_admin`, `orders_admin`, `items_admin`) to manage the entire ecosystem.
* Explicit database schema privileges granted using `GRANT SELECT, INSERT, UPDATE, DELETE` to `anon` and `authenticated` roles.

---

## 🛠️ Project Setup Instructions

### 1. Setup Supabase
1. Create a new database project on **[Supabase](https://supabase.com)**.
2. Navigate to the **SQL Editor** inside your Supabase dashboard.
3. Open the file **`supabase_schema.sql`** located in the root of this project.
4. Copy its entire content, paste it into the editor, and click **Run**.

### 2. Configure Environment Variables
Create a file named `.env.local` in the root of the project and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_NAME=IronRoots
NEXT_PUBLIC_SHIPPING_FEE=200
```

### 3. Install & Start Development Server
```bash
# Install dependencies
npm install

# Start local server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Promoting a User to Admin Role
To access the premium admin panel, create an account on the frontend `/account` page, then execute this query in the Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-signup-email@example.com'
);
```

---

## 🎨 Technology Stack
* **Framework:** Next.js (App Router, Turbopack, Server Actions)
* **Database:** PostgreSQL (Supabase)
* **Styling:** TailwindCSS, Premium Minimalist Cream & Ivory Theme System
* **Animations:** Framer Motion (Subtle staggered reveals, smooth easing scroll effects)
