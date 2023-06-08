import GuidedSearch from "./GuidedSearch";

export default {
  title: "GuidedSearch",
  component: GuidedSearch,
  argTypes: {
    state: {
      control: {
        type: "select",
      },
      options: ["landing", "noResults", "oneResult", "multipleResults"],
    },
  },
};

export const Primary = {};
