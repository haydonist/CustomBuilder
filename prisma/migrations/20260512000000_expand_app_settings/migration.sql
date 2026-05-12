-- AlterTable
ALTER TABLE "AppSettings"
  ADD COLUMN "stepperLineColor"          TEXT NOT NULL DEFAULT '#ffffff',
  ADD COLUMN "stepperDotIncompleteColor" TEXT NOT NULL DEFAULT '#808080',
  ADD COLUMN "stepperDotCompleteColor"   TEXT NOT NULL DEFAULT '#476fff',
  ADD COLUMN "stepperDotCurrentColor"    TEXT NOT NULL DEFAULT '#476fff',
  ADD COLUMN "baseCollectionOrder"       TEXT NOT NULL DEFAULT '',
  ADD COLUMN "buckleCollectionOrder"     TEXT NOT NULL DEFAULT '',
  ADD COLUMN "loopCollectionOrder"       TEXT NOT NULL DEFAULT '',
  ADD COLUMN "conchoCollectionOrder"     TEXT NOT NULL DEFAULT '',
  ADD COLUMN "tipCollectionOrder"        TEXT NOT NULL DEFAULT '',
  ADD COLUMN "conchoRecommendationText"  TEXT NOT NULL DEFAULT '<p><strong>Our Recommendation:</strong> Using the same concho in sets of 5, 7, or 9 usually looks best and qualifies for a discount. Other quantities or mixing different conchos can end up looking unpolished.</p>',
  ADD COLUMN "checkoutPolicyText"        TEXT NOT NULL DEFAULT '<p>Free cancellation is available within 24 business hours of placing your order. After an order is placed, our team will contact you to confirm all order details.</p><p>Each belt is custom-tailored to your specifications. Because custom belts cannot be reused or resold, a <strong>30% restocking fee</strong> will apply if a return is requested after the order has been completed.</p>';
