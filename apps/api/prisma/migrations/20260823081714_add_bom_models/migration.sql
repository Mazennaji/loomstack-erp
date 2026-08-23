-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "unitCost" DECIMAL(12,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BomVersion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BomVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BomLine" (
    "id" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "bomVersionId" TEXT NOT NULL,
    "parentProductId" TEXT NOT NULL,
    "componentProductId" TEXT NOT NULL,

    CONSTRAINT "BomLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BomVersion_productId_version_key" ON "BomVersion"("productId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "BomLine_bomVersionId_componentProductId_key" ON "BomLine"("bomVersionId", "componentProductId");

-- AddForeignKey
ALTER TABLE "BomVersion" ADD CONSTRAINT "BomVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomLine" ADD CONSTRAINT "BomLine_bomVersionId_fkey" FOREIGN KEY ("bomVersionId") REFERENCES "BomVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomLine" ADD CONSTRAINT "BomLine_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomLine" ADD CONSTRAINT "BomLine_componentProductId_fkey" FOREIGN KEY ("componentProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
