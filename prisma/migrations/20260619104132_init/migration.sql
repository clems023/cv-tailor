-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobOffer" TEXT NOT NULL,
    "originalCv" TEXT NOT NULL,
    "originalLetter" TEXT NOT NULL,
    "generatedCv" TEXT NOT NULL,
    "generatedLetter" TEXT NOT NULL,
    "generatedEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
