# Product Requirement Document (PRD)
## Building Material Inventory & Transaction Web Application

---

### 1. Introduction & Project Summary
This project aims to build an inventory management and transaction recording information system tailored specifically for Building Material Store operations. The defining characteristics of a building material business include high variance in item units (e.g., cement sold per bag or per kg, steel bars per piece, paint per pail or per can) and deep relationships with suppliers and recurring contractual clients.

The system will enable store owners and administrators to track real-time stock levels, record procurement purchases from suppliers, manage sales to customers, and execute stock adjustments for any discrepancies found during inventory audits—all within a secure, digital, accurate, and transparent ecosystem.

---

### 2. Conceptual Clarification: "Master Menu"
*This section provides a clear conceptual foundation regarding Master Data for both the development team and stakeholders.*

**What is Master Data?**
In enterprise systems, **Master Data** represents the core, core-business entities that are foundational, relatively static, and consistently referenced across all operational transactions. It serves as the definitive "Internal Dictionary" of the store.

**Why is Master Data Critical?**
Transactions cannot occur in a vacuum. A sales or purchase transaction cannot be processed unless the item, the supplier, or the buyer is already recognized by the system.
- **Master Items (Barang):** The source of truth for all materials sold. Sales/Purchase modules reference this list to know exactly what items are moving.
- **Master Suppliers:** The directory of wholesalers/distributors from whom you procure materials. Used to track procurement history and account payables.
- **Master Customers (Pelanggan):** The directory of frequent buyers, contractors, or builders. Crucial for managing project delivery addresses and outstanding store credits/receivables.

---

### 3. Architecture & Tech Stack
The application is structured around a Decoupled/Separated Full-Stack architecture or a Next.js Monorepo structure with the following technology assignments:

* **Frontend Framework:** Next.js (React)
    * **Styling:** Tailwind CSS (for rapid, utilities-first responsive design).
    * **UI Components:** ShadcnUI (for accessible, polished, and consistent tables, forms, modals, and dropdowns).
* **Backend Framework:** Node.js & Express.js (serving robust RESTful APIs to handle business logic and middleware security).
* **Database:** MySQL (relational database to safeguard transactional integrity via Foreign Keys and strict transactional processing).

---

### 4. User Flow
1.  **Authentication Page (Login/Register):**
    * New administrators register an account, or existing admins log in securely.
    * The system validates credentials using secure JWT (JSON Web Tokens) or session cookies.
2.  **Dashboard Redirection:**
    * Upon successful authentication, the Admin is redirected to the **Main Dashboard**, rendering a high-level operational summary (total stock value, today's transactions count, and low-stock alerts).
3.  **Sidebar Navigation:**
    * From the Dashboard, the Admin can seamlessly navigate through three central modules: **Master Menu**, **Transaction Menu**, and **Reports Menu**.

---

### 5. UI/UX Design Philosophy: Simple & Minimalist
To optimize operational efficiency and reduce training time for warehouse and retail staff, the application adheres to a strict **Simple & Minimalist** design framework:

* **Clutter-Free Visuals:** Maximize whitespace to prevent visual fatigue. Only display data and actions that are strictly necessary for the active task.
* **Muted Color Palette:** Avoid bright, neon, or hyper-saturated primary colors. Use a sophisticated palette of soft slates, cool grays, and muted dark headers with clear white typography.
* **Linear & Predictable Layouts:** Use standard grid or linear structures. Form fields are arranged predictably (top-to-bottom, left-to-right) with explicit field spacing.
* **Persistent Focus Reduction:** Replace complex multi-step multi-page multi-tab configurations with simple, single-purpose modals (`<Dialog />`) for quick creation or update flows.

---

### 6. Functional Requirements & Module Breakdown

#### 6.1. Admin Authentication
* **Registration:** Form inputs for name, email, password, and password confirmation.
* **Login:** Email and password input with global route protection (unauthenticated users are automatically bounced back to the login page).

#### 6.2. Master Menu (Core Data Management)
Every submenu under this module implements standard CRUD (*Create, Read, Update, Delete*) operations.
* **Master Items:** List, add, edit, and archive building materials.
* **Master Suppliers:** Manage distributor partnerships, including operational statuses and administrative logs.
* **Master Customers:** Maintain records of individual buyers and independent contractors to streamline invoice routing.

#### 6.3. Transaction Menu (Operational Processing)
* **Purchase Module (Type B - Beli):** Records incoming freight inventory from suppliers. Automatically increments the physical stock balance upon final invoice validation.
* **Sales Module (Type J - Jual):** Records outgoing inventory purchased by buyers. Automatically pulls standard unit prices from the pricing matrix and decrements physical stock.
* **Adjustment Module (Type K - Koreksi):** Vital for stock opname (physical inventory reconciliation). If the system reports 50 bags of cement but physical warehouse counts yield only 48 due to damage/leakage, the admin logs a `-2` adjustment here to realign the system record with physical truth.

#### 6.4. Reports Menu (Analytical Intelligence)
* **Stock Ledger:** Current available balances across all items, converted into warehouse storage units, with automated low-stock flagging.
* **Transaction Logs:** Comprehensive historical trail of all actions (Purchases, Sales, Adjustments) filterable by custom date ranges.
* **Supplier Analytics:** Performance and supply frequencies mapped to individual vendors.

---

### 7. Database Schema Design (MySQL)

#### 1. Item Table (`table_barang`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `kode_barang` | VARCHAR(50) | PRIMARY KEY | Unique item identifier (e.g., BRG-001, SMN-TIGA) |
| `nama_barang` | VARCHAR(255) | NOT NULL | Full descriptive name (e.g., Cement Tiga Roda 40kg) |

#### 2. Supplier Table (`table_supplier`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `kode_supplier` | VARCHAR(50) | PRIMARY KEY | Unique vendor ID (e.g., SPL-001) |
| `nama_supplier` | VARCHAR(255) | NOT NULL | Company name / Wholesale name |
| `alamat` | TEXT | | Registered office or warehouse address |
| `no_telp` | VARCHAR(20) | | Active phone contact |
| `status` | ENUM('Active', 'Inactive') | DEFAULT 'Active' | Partnership status |
| `keterangan` | TEXT | | Operational notes (e.g., "Steel distributor only") |

#### 3. Customer Table (`table_pelanggan`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `kode_pelanggan` | VARCHAR(50) | PRIMARY KEY | Unique buyer ID (e.g., PLG-001, PLG-CASH) |
| `nama_pelanggan` | VARCHAR(255) | NOT NULL | Full name / General contractor company name |
| `alamat_pelanggan`| TEXT | | Residential or construction site address |
| `no_telp` | VARCHAR(20) | | Contact phone number |

#### 4. Transaction Table (`table_transaksi`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id_transaksi` | INT | PRIMARY KEY, AUTO_INC | Unique internal row sequence |
| `no_invoice` | VARCHAR(100) | NOT NULL | Invoice or billing receipt reference number |
| `transaksi_type`| ENUM('B', 'J', 'K') | NOT NULL | B = Purchase, J = Sale, K = Adjustment |
| `tanggal_transaksi`| DATETIME | NOT NULL | Date and time stamp of validation |
| `kode_barang` | VARCHAR(50) | FOREIGN KEY | References `table_barang.kode_barang` |
| `qty` | DECIMAL(10,2) | NOT NULL | Quantity metric involved |
| `kode_referensi`| VARCHAR(50) | NULLABLE | Holds `kode_supplier` or `kode_pelanggan` based on context |

#### 5. Unit Conversion Table (`table_konversi_satuan`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id_konversi` | INT | PRIMARY KEY, AUTO_INC | Unique conversion ID |
| `kode_barang` | VARCHAR(50) | FOREIGN KEY | References `table_barang.kode_barang` |
| `satuan_asal` | VARCHAR(50) | NOT NULL | Procurement unit bulk packaging (e.g., Pallet, Box, Bag) |
| `satuan_stock` | VARCHAR(50) | NOT NULL | Standardized base unit in stock (e.g., Pcs, Kg) |
| `nilai_konversi`| DECIMAL(10,2) | NOT NULL | Multiplier value (e.g., 1 Bag = 40.00 Kg) |

#### 6. Pricing Table (`table_harga`)
| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id_harga` | INT | PRIMARY KEY, AUTO_INC | Unique pricing configuration ID |
| `kode_barang` | VARCHAR(50) | FOREIGN KEY | References `table_barang.kode_barang` |
| `satuan` | VARCHAR(50) | NOT NULL | Target unit for retail sales (e.g., Bag, Kg, Piece) |
| `harga_jual` | DECIMAL(12,2) | NOT NULL | Standard retail unit price value |

---

### 8. Non-Functional Requirements
1.  **Security Architecture:** All Express.js endpoints handling transactional CRUD operations must enforce rigorous JWT verification layers. Passwords must be non-reversible, hashed via `bcrypt` with an optimal salt round configuration before DB persisting.
2.  **Layout Performance & Fluidity:** Tailwind CSS utilities must be tree-shaken upon build compile to keep client bundles micro-sized, maintaining high-speed responsiveness on standard mobile browsers, warehouse tablets, or shop desktops.
3.  **Strict Business Validation:** Transaction quantity inputs must be validated client-side and server-side to intercept illogical parameters (e.g., preventing negative values on standard sales or procurement entries, while allowing signed numbers exclusively in Adjustments).

---

### 9. Component Implementation Guidelines (ShadcnUI)
* **Data Presentation:** Leverage ShadcnUI's `<DataTable />` pre-built pattern for rendering rows. Integrate localized client-side search indexing and pagination blocks directly to comfortably handle broad datasets containing hundreds of material entries.
* **Minimal Interaction Forms:** Instead of routing workflows to external views, encapsulate standard data mutations inside inline `<Dialog />` and `<Select />` dropdowns to preserve dashboard context and speed up admin productivity.
