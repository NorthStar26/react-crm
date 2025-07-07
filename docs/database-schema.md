# Bottle CRM - Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        UUID id PK
        string username UK
        string email UK
        string password
        enum role
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    Lead {
        UUID id PK
        string name
        string website
        decimal amount
        integer probability
        enum status
        enum lead_source
        text notes
        UUID assign_to_id FK
        UUID contact_id FK
        UUID company_id FK
        datetime created_at
        datetime updated_at
    }

    Contact {
        UUID id PK
        string first_name
        string last_name
        string email UK
        string phone
        string job_title
        UUID lead_id FK
        UUID company_id FK
        datetime created_at
        datetime updated_at
    }

    Company {
        UUID id PK
        string name
        string website
        string email
        string phone
        string industry
        string billing_address
        string city
        string country
        datetime created_at
        datetime updated_at
    }

    Opportunity {
        UUID id PK
        string name
        UUID account_id FK
        UUID contact_id FK
        UUID lead_id FK
        decimal amount
        string currency
        enum stage
        integer probability
        enum lead_source
        UUID assign_to_id FK
        date due_date
        text description
        datetime created_at
        datetime updated_at
    }

    Account {
        UUID id PK
        UUID company_id FK
        enum status
        UUID assigned_user_id FK
        datetime created_at
        datetime updated_at
    }

    Case {
        UUID id PK
        string title
        enum status
        enum case_type
        text description
        UUID account_id FK
        UUID assigned_to_id FK
        datetime created_at
        datetime updated_at
    }

    Tag {
        UUID id PK
        string name UK
        datetime created_at
    }

    Team {
        UUID id PK
        string name
        datetime created_at
    }

    %% Many-to-Many relationship tables
    LeadTag {
        UUID lead_id FK
        UUID tag_id FK
    }

    ContactTag {
        UUID contact_id FK
        UUID tag_id FK
    }

    CompanyTag {
        UUID company_id FK
        UUID tag_id FK
    }

    OpportunityTag {
        UUID opportunity_id FK
        UUID tag_id FK
    }

    TeamMember {
        UUID team_id FK
        UUID user_id FK
    }

    %% Relationships
    User ||--o{ Lead : "assigns to"
    User ||--o{ Opportunity : "assigns to"
    User ||--o{ Account : "manages"
    User ||--o{ Case : "handles"

    Company ||--o{ Contact : "employs"
    Company ||--o{ Lead : "generates"
    Company ||--o{ Opportunity : "creates"
    Company ||--|| Account : "becomes"

    Contact ||--|| Lead : "is associated with"
    Contact ||--o{ Opportunity : "participates in"

    Lead ||--o| Opportunity : "converts to"

    Opportunity ||--o| Account : "results in"

    Account ||--o{ Case : "generates"

    %% Many-to-Many relationships
    Lead ||--o{ LeadTag : ""
    Tag ||--o{ LeadTag : ""

    Contact ||--o{ ContactTag : ""
    Tag ||--o{ ContactTag : ""

    Company ||--o{ CompanyTag : ""
    Tag ||--o{ CompanyTag : ""

    Opportunity ||--o{ OpportunityTag : ""
    Tag ||--o{ OpportunityTag : ""

    Team ||--o{ TeamMember : ""
    User ||--o{ TeamMember : ""
```

## Relationship Definitions

### Primary Relationships

1. **User Management**

   - User → Lead (1:M) - Users can be assigned to multiple leads
   - User → Opportunity (1:M) - Users manage multiple opportunities
   - User → Account (1:M) - Users handle multiple accounts
   - User → Case (1:M) - Users resolve multiple cases

2. **Sales Funnel Flow**

   ```
   Lead → Opportunity → Account → Case
   ```

3. **Company-Centric Relationships**

   - Company → Contact (1:M) - Companies have multiple contacts
   - Company → Lead (1:M) - Companies generate multiple leads
   - Company → Account (1:1) - Company becomes an Account when deal is won

4. **Contact Relationships**
   - Contact ↔ Lead (1:1) - Each lead has one primary contact
   - Contact → Opportunity (1:M) - Contacts can be involved in multiple opportunities

### Secondary Relationships

5. **Tagging System**

   - Tags can be applied to: Leads, Contacts, Companies, Opportunities
   - Many-to-Many relationships via junction tables

6. **Team Management**
   - Team ↔ User (M:M) - Users can belong to multiple teams

## Data Flow

```mermaid
flowchart TD
    A[New Lead] --> B[Qualify Lead]
    B --> C[Create Opportunity]
    C --> D[Work Opportunity]
    D --> E{Won/Lost?}
    E -->|Won| F[Create Account]
    E -->|Lost| G[Close Opportunity]
    F --> H[Generate Cases]
    H --> I[Resolve Cases]

    style A fill:#e1f5fe
    style F fill:#c8e6c9
    style G fill:#ffcdd2
```

## Key Business Rules

1. **Lead to Opportunity**: A Lead can be converted to an Opportunity
2. **Opportunity to Account**: A won Opportunity creates an Account
3. **Account to Case**: Accounts generate support Cases
4. **User Assignment**: All entities can be assigned to Users for responsibility
5. **Company Centricity**: Companies are central entities linking Contacts, Leads, and Accounts

## API Endpoints Mapping

Based on the ApiUrls.tsx file:

```typescript
// Current API endpoints
LoginUrl = 'auth/login';
UsersUrl = 'users'; // → User entity
LeadUrl = 'leads'; // → Lead entity
ContactUrl = 'contacts'; // → Contact entity
CompanyUrl = 'leads/company'; // → Company entity
OpportunityUrl = 'opportunities'; // → Opportunity entity
AccountsUrl = 'accounts'; // → Account entity
CasesUrl = 'cases'; // → Case entity
```

This schema provides a comprehensive CRM system supporting the full customer lifecycle from initial lead through ongoing account management and support.
