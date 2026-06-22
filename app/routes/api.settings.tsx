import type { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

const DEFAULTS = {
  backgroundColor: "#291c12",
  fontFamily: "Arial, sans-serif",
  fontColor: "#ffffff",
  stepperLineColor: "#ffffff",
  stepperDotIncompleteColor: "#808080",
  stepperDotCompleteColor: "#476fff",
  stepperDotCurrentColor: "#476fff",
  baseCollectionOrder: "",
  buckleCollectionOrder: "",
  loopCollectionOrder: "",
  conchoCollectionOrder: "",
  tipCollectionOrder: "",
  conchoRecommendationText:
    "<p><strong>Our Recommendation:</strong> Using the same concho in sets of 5, 7, or 9 usually looks best and qualifies for a discount. Other quantities or mixing different conchos can end up looking unpolished.</p>",
  checkoutPolicyText:
    "<p>Free cancellation is available within 24 business hours of placing your order. After an order is placed, our team will contact you to confirm all order details.</p><p>Each belt is custom-tailored to your specifications. Because custom belts cannot be reused or resold, a <strong>30% restocking fee</strong> will apply if a return is requested after the order has been completed.</p>",
  readyGlowColor: "#ffffff",
  readyGlowSpeed: "3",
  readyGlowBlur: "8",
  readyGlowSpread: "2",
  readyGlowTail: "150",
};

// Public read endpoint for theme extensions / runtime fetches.
// The primary delivery channel is the shop metafield (rendered into liquid
// at section render time); this endpoint exists as a fallback / for any
// JS that wants to refresh live without a full page reload.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "Shop parameter is required" },
      { status: 400 },
    );
  }

  const settings = await prisma.appSettings.findUnique({
    where: { shop },
  });

  const payload = settings
    ? Object.fromEntries(
        Object.keys(DEFAULTS).map((key) => [
          key,
          (settings as Record<string, unknown>)[key],
        ]),
      )
    : DEFAULTS;

  return Response.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300",
    },
  });
};
