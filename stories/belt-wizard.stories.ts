import { html, TemplateResult } from "lit";

import "../src/belt-wizard.js";
import { Theme } from "../src/belt-wizard.js";

export default {
  title: "Custom Belt Wizard",
  component: "belt-wizard",
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  header?: string;
  theme?: Theme;
}

const Template: Story<ArgTypes> = (
  { header, theme = Theme.dark }: ArgTypes,
) =>
  html`
    <belt-wizard .header="${header}"></belt-wizard>
  `;

export const App = Template.bind({});
App.args = {
  header: "Belt Customization Wizard",
};
