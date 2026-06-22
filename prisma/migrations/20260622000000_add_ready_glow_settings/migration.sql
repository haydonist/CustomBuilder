-- AlterTable
ALTER TABLE "AppSettings"
  ADD COLUMN "readyGlowColor"  TEXT NOT NULL DEFAULT '#ffffff',
  ADD COLUMN "readyGlowSpeed"  TEXT NOT NULL DEFAULT '3',
  ADD COLUMN "readyGlowBlur"   TEXT NOT NULL DEFAULT '8',
  ADD COLUMN "readyGlowSpread" TEXT NOT NULL DEFAULT '2',
  ADD COLUMN "readyGlowTail"   TEXT NOT NULL DEFAULT '150';
