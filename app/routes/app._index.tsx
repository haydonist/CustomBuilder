import { useState, useEffect } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  HeadersFunction,
} from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useAppBridge } from "@shopify/app-bridge-react";
import prisma from "../db.server";

const METAFIELD_NAMESPACE = "custom_belt_builder";
const METAFIELD_KEY = "settings";

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
};

type SettingsValues = typeof DEFAULTS;
type SettingsKey = keyof SettingsValues;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { shop: session.shop, ...DEFAULTS },
    });
  }

  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const next: SettingsValues = { ...DEFAULTS };
  (Object.keys(DEFAULTS) as SettingsKey[]).forEach((key) => {
    const value = formData.get(key);
    if (typeof value === "string") next[key] = value;
  });

  const settings = await prisma.appSettings.upsert({
    where: { shop: session.shop },
    update: next,
    create: { shop: session.shop, ...next },
  });

  const shopIdResponse = await admin.graphql(`#graphql
    query ShopId { shop { id } }
  `);
  const shopIdJson = (await shopIdResponse.json()) as {
    data: { shop: { id: string } };
  };
  const shopId = shopIdJson.data.shop.id;

  const metafieldsResponse = await admin.graphql(
    `#graphql
      mutation SetBeltWizardSettings($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id namespace key }
          userErrors { field message code }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "json",
            value: JSON.stringify(next),
          },
        ],
      },
    },
  );

  const metafieldsJson = (await metafieldsResponse.json()) as {
    data: {
      metafieldsSet: {
        userErrors: Array<{ field: string[]; message: string; code: string }>;
      };
    };
  };
  const userErrors = metafieldsJson.data.metafieldsSet.userErrors;

  if (userErrors.length > 0) {
    return {
      success: false,
      settings,
      error: userErrors.map((e) => e.message).join("; "),
    };
  }

  return { success: true, settings };
};

type ResetButtonProps = {
  onReset: () => void;
  disabled: boolean;
};

function ResetButton({ onReset, disabled }: ResetButtonProps) {
  return (
    <s-button
      type="button"
      variant="tertiary"
      onClick={onReset}
      {...(disabled ? { disabled: true } : {})}
    >
      Reset to default
    </s-button>
  );
}

type ColorFieldProps = {
  label: string;
  name: SettingsKey;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
};

function ColorField({
  label,
  name,
  value,
  defaultValue,
  onChange,
}: ColorFieldProps) {
  return (
    <s-stack direction="block" gap="base">
      <s-text variant="heading-sm">{label}</s-text>
      <s-stack direction="inline" gap="base" align="center">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontFamily: "monospace",
            width: "120px",
          }}
        />
        <ResetButton
          onReset={() => onChange(defaultValue)}
          disabled={value === defaultValue}
        />
      </s-stack>
    </s-stack>
  );
}

type TextareaFieldProps = {
  label: string;
  name: SettingsKey;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
  placeholder?: string;
  info?: string;
};

function TextareaField({
  label,
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  info,
}: TextareaFieldProps) {
  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="inline" gap="base" align="center">
        <s-text variant="heading-sm">{label}</s-text>
        <ResetButton
          onReset={() => onChange(defaultValue)}
          disabled={value === defaultValue}
        />
      </s-stack>
      {info ? (
        <s-text variant="body-sm" tone="subdued">
          {info}
        </s-text>
      ) : null}
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "600px",
          fontFamily: "inherit",
          fontSize: "14px",
          resize: "vertical",
        }}
      />
    </s-stack>
  );
}

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [values, setValues] = useState<SettingsValues>(() => {
    const initial: SettingsValues = { ...DEFAULTS };
    (Object.keys(DEFAULTS) as SettingsKey[]).forEach((key) => {
      initial[key] = (settings as Record<string, unknown>)[key] as string;
    });
    return initial;
  });

  const set = (key: SettingsKey) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const isLoading = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Settings saved");
    } else if (fetcher.data && "error" in fetcher.data && fetcher.data.error) {
      shopify.toast.show(`Save failed: ${fetcher.data.error}`, {
        isError: true,
      });
    }
  }, [fetcher.data, shopify]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    (Object.keys(values) as SettingsKey[]).forEach((key) => {
      formData.append(key, values[key]);
    });
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
      <s-section heading="Appearance">
        <s-paragraph>
          Configure the appearance of your belt customization wizard. Changes
          save to a shop metafield and update on the storefront on the next
          page load.
        </s-paragraph>

        <form onSubmit={handleSubmit}>
          <s-stack direction="block" gap="large">
            <ColorField
              label="Background Color"
              name="backgroundColor"
              value={values.backgroundColor}
              defaultValue={DEFAULTS.backgroundColor}
              onChange={set("backgroundColor")}
            />

            <ColorField
              label="Text Color"
              name="fontColor"
              value={values.fontColor}
              defaultValue={DEFAULTS.fontColor}
              onChange={set("fontColor")}
            />

            <s-stack direction="block" gap="base">
              <s-text variant="heading-sm">Font Family</s-text>
              <s-stack direction="inline" gap="base" align="center">
                <select
                  name="fontFamily"
                  value={values.fontFamily}
                  onChange={(e) => set("fontFamily")(e.target.value)}
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
                <ResetButton
                  onReset={() => set("fontFamily")(DEFAULTS.fontFamily)}
                  disabled={values.fontFamily === DEFAULTS.fontFamily}
                />
              </s-stack>
            </s-stack>
          </s-stack>
        </form>
      </s-section>

      <s-section heading="Stepper">
        <s-stack direction="block" gap="large">
          <ColorField
            label="Line Color"
            name="stepperLineColor"
            value={values.stepperLineColor}
            defaultValue={DEFAULTS.stepperLineColor}
            onChange={set("stepperLineColor")}
          />
          <ColorField
            label="Incomplete Dot Color"
            name="stepperDotIncompleteColor"
            value={values.stepperDotIncompleteColor}
            defaultValue={DEFAULTS.stepperDotIncompleteColor}
            onChange={set("stepperDotIncompleteColor")}
          />
          <ColorField
            label="Complete Dot Color"
            name="stepperDotCompleteColor"
            value={values.stepperDotCompleteColor}
            defaultValue={DEFAULTS.stepperDotCompleteColor}
            onChange={set("stepperDotCompleteColor")}
          />
          <ColorField
            label="Current Dot Color"
            name="stepperDotCurrentColor"
            value={values.stepperDotCurrentColor}
            defaultValue={DEFAULTS.stepperDotCurrentColor}
            onChange={set("stepperDotCurrentColor")}
          />
        </s-stack>
      </s-section>

      <s-section heading="Collection Display Order">
        <s-paragraph>
          Comma-separated collection names in display order. Collections not
          listed appear alphabetically after these.
        </s-paragraph>
        <s-stack direction="block" gap="large">
          <TextareaField
            label="Base Collections"
            name="baseCollectionOrder"
            value={values.baseCollectionOrder}
            defaultValue={DEFAULTS.baseCollectionOrder}
            onChange={set("baseCollectionOrder")}
            placeholder="Premium Leather, Standard Leather, Exotic"
          />
          <TextareaField
            label="Buckle Collections"
            name="buckleCollectionOrder"
            value={values.buckleCollectionOrder}
            defaultValue={DEFAULTS.buckleCollectionOrder}
            onChange={set("buckleCollectionOrder")}
            placeholder="Silver Collection, Gold Collection"
          />
          <TextareaField
            label="Loop Collections"
            name="loopCollectionOrder"
            value={values.loopCollectionOrder}
            defaultValue={DEFAULTS.loopCollectionOrder}
            onChange={set("loopCollectionOrder")}
            placeholder="Collection A, Collection B"
          />
          <TextareaField
            label="Concho Collections"
            name="conchoCollectionOrder"
            value={values.conchoCollectionOrder}
            defaultValue={DEFAULTS.conchoCollectionOrder}
            onChange={set("conchoCollectionOrder")}
            placeholder="Collection A, Collection B"
          />
          <TextareaField
            label="Tip Collections"
            name="tipCollectionOrder"
            value={values.tipCollectionOrder}
            defaultValue={DEFAULTS.tipCollectionOrder}
            onChange={set("tipCollectionOrder")}
            placeholder="Collection A, Collection B"
          />
        </s-stack>
      </s-section>

      <s-section heading="Concho Step">
        <TextareaField
          label="Recommendation Message"
          name="conchoRecommendationText"
          value={values.conchoRecommendationText}
          defaultValue={DEFAULTS.conchoRecommendationText}
          onChange={set("conchoRecommendationText")}
          info="HTML allowed. Shown above the concho selection."
        />
      </s-section>

      <s-section heading="Checkout Policy">
        <TextareaField
          label="Checkout Policy Notice"
          name="checkoutPolicyText"
          value={values.checkoutPolicyText}
          defaultValue={DEFAULTS.checkoutPolicyText}
          onChange={set("checkoutPolicyText")}
          info="HTML allowed. Shown at the checkout step."
        />
      </s-section>

      <s-section heading="Preview">
        <s-box
          padding="large"
          borderWidth="base"
          borderRadius="base"
          style={{
            backgroundColor: values.backgroundColor,
            color: values.fontColor,
            fontFamily: values.fontFamily,
          }}
        >
          <s-stack direction="block" gap="base">
            <s-text
              variant="heading-lg"
              style={{ color: values.fontColor, fontFamily: values.fontFamily }}
            >
              Belt Wizard Preview
            </s-text>
            <s-text
              variant="body-md"
              style={{ color: values.fontColor, fontFamily: values.fontFamily }}
            >
              This is how your belt customization wizard will appear to
              customers on your storefront.
            </s-text>
          </s-stack>
        </s-box>
      </s-section>

      <s-section>
        <s-stack direction="inline" gap="base">
          <s-button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            {...(isLoading ? { loading: true } : {})}
          >
            Save Settings
          </s-button>
          <s-button
            type="button"
            onClick={() => setValues({ ...DEFAULTS })}
          >
            Reset to Defaults
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
