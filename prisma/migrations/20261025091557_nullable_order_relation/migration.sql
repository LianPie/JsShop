-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressid_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userid_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userid" DROP NOT NULL,
ALTER COLUMN "addressid" DROP NOT NULL,
ALTER COLUMN "addressid" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressid_fkey" FOREIGN KEY ("addressid") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
