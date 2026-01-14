import { useState, useEffect } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { HeadersFunction } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Get or create settings for this shop
  let settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        shop: session.shop,
        backgroundColor: "#291c12",
        fontFamily: "Arial, sans-serif",
        fontColor: "#ffffff",
      },
    });
  }

  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const backgroundColor = formData.get("backgroundColor") as string;
  const fontFamily = formData.get("fontFamily") as string;
  const fontColor = formData.get("fontColor") as string;

  const settings = await prisma.appSettings.upsert({
    where: { shop: session.shop },
    update: {
      backgroundColor,
      fontFamily,
      fontColor,
    },
    create: {
      shop: session.shop,
      backgroundColor,
      fontFamily,
      fontColor,
    },
  });

  return { success: true, settings };
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontColor, setFontColor] = useState(settings.fontColor);

  const isLoading = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Settings saved successfully");
    }
  }, [fetcher.data?.success, shopify]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("backgroundColor", backgroundColor);
    formData.append("fontFamily", fontFamily);
    formData.append("fontColor", fontColor);
    fetcher.submit(formData, { method: "POST" });
  };

  const fontOptions = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Helvetica", value: "Helvetica, sans-serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  ];

  return (
    <s-page heading="Belt Wizard Settings">
      <s-section heading="Customize Belt Wizard Appearance">
        <s-paragraph>
          Configure the appearance of your belt customization wizard. These
          settings will apply to the belt wizard displayed on your storefront.
        </s-paragraph>

        <form onSubmit={handleSubmit}>
          <s-stack direction="block" gap="large">
            {/* Background Color */}
            <s-stack direction="block" gap="base">
              <s-text variant="heading-sm">Background Color</s-text>
              <s-stack direction="inline" gap="base" align="center">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{
                    width: "60px",
                    height: "40px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#291c12"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    width: "120px",
                  }}
                />
                <s-text variant="body-sm" tone="subdued">
                  Current: {backgroundColor}
                </s-text>
              </s-stack>
            </s-stack>

            {/* Font Family */}
            <s-stack direction="block" gap="base">
              <s-text variant="heading-sm">Font Family</s-text>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "300px",
                  fontSize: "14px",
                }}
              >
                {fontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <s-text
                variant="body-sm"
                tone="subdued"
                style={{ fontFamily }}
              >
                Preview: The quick brown fox jumps over the lazy dog
              </s-text>
            </s-stack>

            {/* Font Color */}
            <s-stack direction="block" gap="base">
              <s-text variant="heading-sm">Font Color</s-text>
              <s-stack direction="inline" gap="base" align="center">
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  style={{
                    width: "60px",
                    height: "40px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  placeholder="#ffffff"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    width: "120px",
                  }}
                />
                <s-text variant="body-sm" tone="subdued">
                  Current: {fontColor}
                </s-text>
              </s-stack>
            </s-stack>

            {/* Preview */}
            <s-stack direction="block" gap="base">
              <s-text variant="heading-sm">Preview</s-text>
              <s-box
                padding="large"
                borderWidth="base"
                borderRadius="base"
                style={{
                  backgroundColor,
                  color: fontColor,
                  fontFamily,
                }}
              >
                <s-stack direction="block" gap="base">
                  <s-text
                    variant="heading-lg"
                    style={{ color: fontColor, fontFamily }}
                  >
                    Belt Wizard Preview
                  </s-text>
                  <s-text
                    variant="body-md"
                    style={{ color: fontColor, fontFamily }}
                  >
                    This is how your belt customization wizard will appear to
                    customers on your storefront.
                  </s-text>
                </s-stack>
              </s-box>
            </s-stack>

            {/* Save Button */}
            <s-stack direction="inline" gap="base">
              <s-button
                type="submit"
                variant="primary"
                {...(isLoading ? { loading: true } : {})}
              >
                Save Settings
              </s-button>
              <s-button
                type="button"
                onClick={() => {
                  setBackgroundColor("#291c12");
                  setFontFamily("Arial, sans-serif");
                  setFontColor("#ffffff");
                }}
              >
                Reset to Defaults
              </s-button>
            </s-stack>
          </s-stack>
        </form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
