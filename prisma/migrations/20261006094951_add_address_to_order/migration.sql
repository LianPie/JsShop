-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "addressid" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressid_fkey" FOREIGN KEY ("addressid") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
