import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
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
    <button
      type="button"
      onClick={onReset}
      disabled={disabled}
      title="Reset to default"
      aria-label="Reset to default"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        padding: 0,
        border: "none",
        borderRadius: "50%",
        background: "transparent",
        color: disabled ? "#9ca3af" : "#2563eb",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <polyline points="3 3 3 9 9 9" />
      </svg>
    </button>
  );
}

type ColorFieldProps = {
  label: string;
  name: SettingsKey;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
};

function normalizeHex(input: string): string | null {
  let v = input.trim();
  if (!v) return null;
  if (!v.startsWith("#")) v = "#" + v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    v = `#${r}${r}${g}${g}${b}${b}`;
  }
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : null;
}

function ColorField({
  label,
  value,
  defaultValue,
  onChange,
}: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const commitHexDraft = () => {
    const normalized = normalizeHex(hexDraft);
    if (normalized) {
      onChange(normalized);
      setHexDraft(normalized);
    } else {
      setHexDraft(value);
    }
  };

  return (
    <s-stack direction="block" gap="base">
      <s-text variant="heading-sm">{label}</s-text>
      <s-stack direction="inline" gap="base" align="center">
        <div ref={containerRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open color picker"
            style={{
              width: "60px",
              height: "40px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              background: value,
              padding: 0,
            }}
          />
          {open ? (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                zIndex: 20,
                padding: "12px",
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              <HexColorPicker color={value} onChange={onChange} />
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  HEX
                </span>
                <input
                  type="text"
                  value={hexDraft}
                  onChange={(e) => setHexDraft(e.target.value)}
                  onBlur={commitHexDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitHexDraft();
                    }
                  }}
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    width: "100px",
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <input
          type="text"
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHexDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitHexDraft();
            }
          }}
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

type RichTextFieldProps = {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
  info?: string;
};

type ToolbarButtonProps = {
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onMouseDown, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={title}
      aria-label={title}
      style={{
        minWidth: "32px",
        height: "28px",
        padding: "0 8px",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        background: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontFamily: "inherit",
        color: "#111827",
      }}
    >
      {children}
    </button>
  );
}

function RichTextField({
  label,
  value,
  defaultValue,
  onChange,
  info,
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!editorRef.current) return;
    if (value !== lastEmittedRef.current) {
      editorRef.current.innerHTML = value;
      lastEmittedRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      // ignore — older browsers
    }
  }, []);

  const emit = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastEmittedRef.current = html;
    onChange(html);
  };

  const exec = (command: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false);
    emit();
  };

  const clearFormatting = (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand("removeFormat", false);
    emit();
  };

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
      <div
        style={{
          maxWidth: "600px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "6px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
          }}
        >
          <ToolbarButton onMouseDown={exec("bold")} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onMouseDown={exec("italic")} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onMouseDown={exec("underline")} title="Underline">
            <span style={{ textDecoration: "underline" }}>U</span>
          </ToolbarButton>
          <ToolbarButton
            onMouseDown={exec("insertUnorderedList")}
            title="Bulleted list"
          >
            •
          </ToolbarButton>
          <ToolbarButton
            onMouseDown={clearFormatting}
            title="Clear formatting"
          >
            ⨯
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          style={{
            padding: "10px 12px",
            minHeight: "100px",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        />
      </div>
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
        <RichTextField
          label="Recommendation Message"
          value={values.conchoRecommendationText}
          defaultValue={DEFAULTS.conchoRecommendationText}
          onChange={set("conchoRecommendationText")}
          info="Shown above the concho selection."
        />
      </s-section>

      <s-section heading="Checkout Policy">
        <RichTextField
          label="Checkout Policy Notice"
          value={values.checkoutPolicyText}
          defaultValue={DEFAULTS.checkoutPolicyText}
          onChange={set("checkoutPolicyText")}
          info="Shown at the checkout step."
        />
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
