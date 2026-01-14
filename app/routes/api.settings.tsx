import type { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";

// Public API endpoint for theme extension to fetch settings
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "Shop parameter is required" },
      { status: 400 }
    );
  }

  // Get settings for the shop
  let settings = await prisma.appSettings.findUnique({
    where: { shop },
  });

  // Return defaults if not found
  if (!settings) {
    settings = {
      id: "",
      shop,
      backgroundColor: "#291c12",
      fontFamily: "Arial, sans-serif",
      fontColor: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return Response.json({
    backgroundColor: settings.backgroundColor,
    fontFamily: settings.fontFamily,
    fontColor: settings.fontColor,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
    },
  });
};
