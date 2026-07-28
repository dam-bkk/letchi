-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brn" TEXT NOT NULL,
    "vatNo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ebsMode" TEXT NOT NULL DEFAULT 'SIMULATED',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "initials" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brn" TEXT,
    "vatNo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitPriceCents" INTEGER NOT NULL,
    "vatRate" INTEGER NOT NULL DEFAULT 15,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INVOICE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "customerId" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MUR',
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "vatCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "relatedNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "unitPriceCents" INTEGER NOT NULL,
    "vatRate" INTEGER NOT NULL DEFAULT 15,
    "totalCents" INTEGER NOT NULL,
    CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'bank_transfer',
    "reference" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fiscalisation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "irn" TEXT NOT NULL,
    "qrPayload" TEXT NOT NULL,
    "requestJson" TEXT NOT NULL,
    "responseJson" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fiscalisation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Fiscalisation_invoiceId_key" ON "Fiscalisation"("invoiceId");
