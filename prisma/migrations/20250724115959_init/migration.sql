-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Eq', 'Op', 'In', 'Total');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "passportNumber" TEXT,
    "currentAddress" TEXT,
    "permanentAddress" TEXT,
    "alternateContactNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "panNumber" TEXT,
    "aadhaarNumber" TEXT,
    "educationDetails" TEXT,
    "bloodGroup" TEXT,
    "photoFileName" TEXT,
    "share" INTEGER,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passportNumber" TEXT,
    "currentAddress" TEXT,
    "permanentAddress" TEXT,
    "alternateContactNumber" TEXT,
    "primaryContactNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "panNumber" TEXT,
    "aadhaarNumber" TEXT,
    "educationDetails" TEXT,
    "bloodGroup" TEXT,
    "photoFileName" TEXT,
    "share" INTEGER,
    "accountNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquityPerformance" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountNumber" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "orders" INTEGER NOT NULL,
    "fills" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "startCash" DOUBLE PRECISION NOT NULL,
    "startUnrealized" DOUBLE PRECISION NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "comm" DOUBLE PRECISION NOT NULL,
    "ecnFee" DOUBLE PRECISION NOT NULL,
    "sec" DOUBLE PRECISION NOT NULL,
    "orf" DOUBLE PRECISION NOT NULL,
    "cat" DOUBLE PRECISION NOT NULL,
    "taf" DOUBLE PRECISION NOT NULL,
    "nfa" DOUBLE PRECISION NOT NULL,
    "nscc" DOUBLE PRECISION NOT NULL,
    "acc" DOUBLE PRECISION NOT NULL,
    "clr" DOUBLE PRECISION NOT NULL,
    "misc" DOUBLE PRECISION NOT NULL,
    "tradeFees" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "feeDailyInterest" DOUBLE PRECISION NOT NULL,
    "feeDividends" DOUBLE PRECISION NOT NULL,
    "feeMisc" DOUBLE PRECISION NOT NULL,
    "feeShortInterest" DOUBLE PRECISION NOT NULL,
    "stockLocate" DOUBLE PRECISION NOT NULL,
    "techFees" DOUBLE PRECISION NOT NULL,
    "adjFees" DOUBLE PRECISION NOT NULL,
    "adjNet" DOUBLE PRECISION NOT NULL,
    "unrealizedDelta" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cashInOut" DOUBLE PRECISION NOT NULL,
    "transfer" DOUBLE PRECISION NOT NULL,
    "endCash" DOUBLE PRECISION NOT NULL,
    "endUnrealized" DOUBLE PRECISION NOT NULL,
    "endBalance" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "empShare" DOUBLE PRECISION,
    "tranAmount" DOUBLE PRECISION,

    CONSTRAINT "EquityPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionsPerformance" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountNumber" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "orders" INTEGER NOT NULL,
    "fills" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "startCash" DOUBLE PRECISION NOT NULL,
    "startUnrealized" DOUBLE PRECISION NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "comm" DOUBLE PRECISION NOT NULL,
    "ecnFee" DOUBLE PRECISION NOT NULL,
    "sec" DOUBLE PRECISION NOT NULL,
    "orf" DOUBLE PRECISION NOT NULL,
    "cat" DOUBLE PRECISION NOT NULL,
    "taf" DOUBLE PRECISION NOT NULL,
    "nfa" DOUBLE PRECISION NOT NULL,
    "nscc" DOUBLE PRECISION NOT NULL,
    "acc" DOUBLE PRECISION NOT NULL,
    "clr" DOUBLE PRECISION NOT NULL,
    "misc" DOUBLE PRECISION NOT NULL,
    "tradeFees" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "feeDailyInterest" DOUBLE PRECISION NOT NULL,
    "feeDividends" DOUBLE PRECISION NOT NULL,
    "feeMisc" DOUBLE PRECISION NOT NULL,
    "feeShortInterest" DOUBLE PRECISION NOT NULL,
    "stockLocate" DOUBLE PRECISION NOT NULL,
    "techFees" DOUBLE PRECISION NOT NULL,
    "adjFees" DOUBLE PRECISION NOT NULL,
    "adjNet" DOUBLE PRECISION NOT NULL,
    "unrealizedDelta" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cashInOut" DOUBLE PRECISION NOT NULL,
    "transfer" DOUBLE PRECISION NOT NULL,
    "endCash" DOUBLE PRECISION NOT NULL,
    "endUnrealized" DOUBLE PRECISION NOT NULL,
    "endBalance" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "empShare" DOUBLE PRECISION,
    "tranAmount" DOUBLE PRECISION,

    CONSTRAINT "OptionsPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntradayPerformance" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountNumber" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "orders" INTEGER NOT NULL,
    "fills" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "startCash" DOUBLE PRECISION NOT NULL,
    "startUnrealized" DOUBLE PRECISION NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "comm" DOUBLE PRECISION NOT NULL,
    "ecnFee" DOUBLE PRECISION NOT NULL,
    "sec" DOUBLE PRECISION NOT NULL,
    "orf" DOUBLE PRECISION NOT NULL,
    "cat" DOUBLE PRECISION NOT NULL,
    "taf" DOUBLE PRECISION NOT NULL,
    "nfa" DOUBLE PRECISION NOT NULL,
    "nscc" DOUBLE PRECISION NOT NULL,
    "acc" DOUBLE PRECISION NOT NULL,
    "clr" DOUBLE PRECISION NOT NULL,
    "misc" DOUBLE PRECISION NOT NULL,
    "tradeFees" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "feeDailyInterest" DOUBLE PRECISION NOT NULL,
    "feeDividends" DOUBLE PRECISION NOT NULL,
    "feeMisc" DOUBLE PRECISION NOT NULL,
    "feeShortInterest" DOUBLE PRECISION NOT NULL,
    "stockLocate" DOUBLE PRECISION NOT NULL,
    "techFees" DOUBLE PRECISION NOT NULL,
    "adjFees" DOUBLE PRECISION NOT NULL,
    "adjNet" DOUBLE PRECISION NOT NULL,
    "unrealizedDelta" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cashInOut" DOUBLE PRECISION NOT NULL,
    "transfer" DOUBLE PRECISION NOT NULL,
    "endCash" DOUBLE PRECISION NOT NULL,
    "endUnrealized" DOUBLE PRECISION NOT NULL,
    "endBalance" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "empShare" DOUBLE PRECISION,
    "tranAmount" DOUBLE PRECISION,

    CONSTRAINT "IntradayPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalPerformance" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountNumber" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "orders" INTEGER NOT NULL,
    "fills" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "startCash" DOUBLE PRECISION NOT NULL,
    "startUnrealized" DOUBLE PRECISION NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "comm" DOUBLE PRECISION NOT NULL,
    "ecnFee" DOUBLE PRECISION NOT NULL,
    "sec" DOUBLE PRECISION NOT NULL,
    "orf" DOUBLE PRECISION NOT NULL,
    "cat" DOUBLE PRECISION NOT NULL,
    "taf" DOUBLE PRECISION NOT NULL,
    "nfa" DOUBLE PRECISION NOT NULL,
    "nscc" DOUBLE PRECISION NOT NULL,
    "acc" DOUBLE PRECISION NOT NULL,
    "clr" DOUBLE PRECISION NOT NULL,
    "misc" DOUBLE PRECISION NOT NULL,
    "tradeFees" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "feeDailyInterest" DOUBLE PRECISION NOT NULL,
    "feeDividends" DOUBLE PRECISION NOT NULL,
    "feeMisc" DOUBLE PRECISION NOT NULL,
    "feeShortInterest" DOUBLE PRECISION NOT NULL,
    "stockLocate" DOUBLE PRECISION NOT NULL,
    "techFees" DOUBLE PRECISION NOT NULL,
    "adjFees" DOUBLE PRECISION NOT NULL,
    "adjNet" DOUBLE PRECISION NOT NULL,
    "unrealizedDelta" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cashInOut" DOUBLE PRECISION NOT NULL,
    "transfer" DOUBLE PRECISION NOT NULL,
    "endCash" DOUBLE PRECISION NOT NULL,
    "endUnrealized" DOUBLE PRECISION NOT NULL,
    "endBalance" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "empShare" DOUBLE PRECISION,
    "tranAmount" DOUBLE PRECISION,

    CONSTRAINT "TotalPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequest_userId_key" ON "OnboardingRequest"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatHistory" ADD CONSTRAINT "AiChatHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingRequest" ADD CONSTRAINT "OnboardingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquityPerformance" ADD CONSTRAINT "EquityPerformance_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionsPerformance" ADD CONSTRAINT "OptionsPerformance_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntradayPerformance" ADD CONSTRAINT "IntradayPerformance_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TotalPerformance" ADD CONSTRAINT "TotalPerformance_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
