// Sanity CLI (sanity dev / deploy). Project and dataset of the website's CMS.
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: "ao8vrenr", dataset: "production" },
  deployment: { autoUpdates: true },
});
