// Sanity CLI (sanity dev / deploy). Project and dataset of the website's CMS.
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: "ao8vrenr", dataset: "production" },
  studioHost: "oww",
  deployment: { appId: "ww1vna25o8ziuw8s8chdfjhd", autoUpdates: true },
});
