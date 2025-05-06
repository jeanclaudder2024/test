# Maritime Tracking Application Database Schema

## Core Tables

### users
- **id**: serial (PK)
- **username**: text (unique, not null)
- **password**: text (nullable for OAuth)
- **email**: text (not null)
- **phone**: text
- **isSubscribed**: boolean
- **subscriptionTier**: text (default "free")
- **stripeCustomerId**: text
- **stripeSubscriptionId**: text
- **provider**: text (for OAuth - 'google', 'local', etc.)
- **providerId**: text (ID from provider)
- **photoURL**: text (profile photo URL)
- **displayName**: text (full name from provider)
- **createdAt**: timestamp (default now)

### vessels
- **id**: serial (PK)
- **name**: text (not null)
- **imo**: text (unique, not null)
- **mmsi**: text (not null)
- **vesselType**: text (not null)
- **flag**: text (not null)
- **built**: integer (year)
- **deadweight**: integer
- **currentLat**: decimal
- **currentLng**: decimal
- **departurePort**: text
- **departureDate**: timestamp
- **departureLat**: decimal
- **departureLng**: decimal
- **destinationPort**: text
- **destinationLat**: decimal
- **destinationLng**: decimal
- **eta**: timestamp
- **cargoType**: text
- **cargoCapacity**: integer
- **currentRegion**: text
- **buyerName**: text (default "NA")
- **sellerName**: text
- **metadata**: text (JSON string)
- **lastUpdated**: timestamp (default now)

### refineries
- **id**: serial (PK)
- **name**: text (not null)
- **country**: text (not null)
- **region**: text (not null)
- **lat**: decimal (not null)
- **lng**: decimal (not null)
- **capacity**: integer (barrels per day)
- **status**: text (default "active")
- **description**: text

### ports
- **id**: serial (PK)
- **name**: text (not null)
- **country**: text (not null)
- **region**: text (not null)
- **lat**: decimal (not null)
- **lng**: decimal (not null)
- **type**: text (default "commercial")
- **capacity**: integer
- **status**: text (default "active")
- **description**: text
- **lastUpdated**: timestamp (default now)

### documents
- **id**: serial (PK)
- **vesselId**: integer (FK to vessels.id)
- **type**: text (not null)
- **title**: text (not null)
- **content**: text (not null)
- **status**: text (default "active")
- **issueDate**: timestamp (default now)
- **expiryDate**: timestamp
- **reference**: text
- **issuer**: text
- **recipientName**: text
- **recipientOrg**: text
- **lastModified**: timestamp (default now)
- **language**: text (default "en")
- **createdAt**: timestamp (default now)

### progressEvents
- **id**: serial (PK)
- **vesselId**: integer (FK to vessels.id)
- **date**: timestamp (not null)
- **event**: text (not null)
- **lat**: decimal
- **lng**: decimal
- **location**: text

## Shipping Companies and Brokers

### companies
- **id**: serial (PK)
- **name**: text (not null)
- **country**: text
- **region**: text
- **headquarters**: text
- **foundedYear**: integer
- **ceo**: text
- **fleetSize**: integer
- **specialization**: text
- **website**: text
- **logo**: text (URL)
- **description**: text
- **revenue**: decimal
- **employees**: integer
- **publiclyTraded**: boolean (default false)
- **stockSymbol**: text
- **status**: text (default "active")
- **createdAt**: timestamp (default now)
- **lastUpdated**: timestamp (default now)

### brokers
- **id**: serial (PK)
- **name**: text (not null)
- **company**: text (not null)
- **email**: text (not null)
- **phone**: text
- **country**: text
- **active**: boolean (default true)
- **eliteMember**: boolean (default false)
- **eliteMemberSince**: timestamp
- **eliteMemberExpires**: timestamp
- **membershipId**: text
- **shippingAddress**: text
- **subscriptionPlan**: text
- **lastLogin**: timestamp

## Infrastructure Connections

### refineryPortConnections
- **id**: serial (PK)
- **refineryId**: integer (FK to refineries.id)
- **portId**: integer (FK to ports.id)
- **distance**: decimal (kilometers)
- **connectionType**: text (default "pipeline")
- **capacity**: decimal (barrels per day)
- **status**: text (default "active")
- **createdAt**: timestamp (default now)
- **lastUpdated**: timestamp (default now)

## Statistics and Metrics

### stats
- **id**: serial (PK)
- **activeVessels**: integer (default 0)
- **totalCargo**: decimal (default 0)
- **activeRefineries**: integer (default 0)
- **activeBrokers**: integer (default 0)
- **lastUpdated**: timestamp (default now)

## Subscription and Payment System

### subscriptionPlans
- **id**: serial (PK)
- **name**: text (not null)
- **slug**: text (unique, not null)
- **description**: text (not null)
- **monthlyPriceId**: text (not null, Stripe price ID)
- **yearlyPriceId**: text (not null, Stripe price ID)
- **monthlyPrice**: decimal (not null)
- **yearlyPrice**: decimal (not null)
- **currency**: text (default "usd")
- **features**: text (JSON array)
- **isPopular**: boolean (default false)
- **trialDays**: integer (default 0)
- **sortOrder**: integer (default 0)
- **isActive**: boolean (default true)
- **createdAt**: timestamp (default now)
- **updatedAt**: timestamp (default now)

### subscriptions
- **id**: serial (PK)
- **userId**: integer (FK to users.id)
- **planId**: integer (FK to subscriptionPlans.id)
- **status**: text (not null)
- **stripeCustomerId**: text
- **stripeSubscriptionId**: text
- **currentPeriodStart**: timestamp
- **currentPeriodEnd**: timestamp
- **cancelAtPeriodEnd**: boolean (default false)
- **billingInterval**: text (not null, default "month")
- **createdAt**: timestamp (default now)
- **updatedAt**: timestamp (default now)

### paymentMethods
- **id**: serial (PK)
- **userId**: integer (FK to users.id)
- **stripePaymentMethodId**: text (not null)
- **type**: text (not null)
- **brand**: text
- **last4**: text
- **expiryMonth**: integer
- **expiryYear**: integer
- **isDefault**: boolean (default false)
- **createdAt**: timestamp (default now)
- **updatedAt**: timestamp (default now)

### invoices
- **id**: serial (PK)
- **userId**: integer (FK to users.id)
- **subscriptionId**: integer (FK to subscriptions.id)
- **stripeInvoiceId**: text (not null)
- **stripeCustomerId**: text
- **amount**: decimal (not null)
- **currency**: text (default "usd")
- **status**: text (not null)
- **billingReason**: text
- **invoiceDate**: timestamp (not null)
- **periodStart**: timestamp
- **periodEnd**: timestamp
- **pdfUrl**: text
- **createdAt**: timestamp (default now)
- **updatedAt**: timestamp (default now)

## Entity Relationships

1. **users ←→ subscriptions**: One user can have multiple subscriptions (historical record)
2. **users ←→ paymentMethods**: One user can have multiple payment methods
3. **users ←→ invoices**: One user has many invoices
4. **subscriptions ←→ subscriptionPlans**: Each subscription is tied to a plan
5. **subscriptions ←→ invoices**: Each subscription can have multiple invoices
6. **vessels ←→ documents**: Each vessel has multiple documents
7. **vessels ←→ progressEvents**: Each vessel has multiple progress events
8. **refineries ←→ refineryPortConnections**: Each refinery can connect to multiple ports
9. **ports ←→ refineryPortConnections**: Each port can connect to multiple refineries