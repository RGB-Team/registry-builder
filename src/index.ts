import { promises as fs } from "fs";
import * as fsync from "fs";
import path from "path";
import { preReq, RegistryItem } from "./lib/schema";
import { isUrl } from "./lib/utils";
// * path to import the registries from
import { Registries } from "../../../data/preReq";

const domain = "https://shadcn-extension.vercel.app";

async function hasSrcFolder(): Promise<string> {
  const srcPath = path.resolve(process.cwd(), "src");
  try {
    await fs.access(srcPath);
    return "src";
  } catch {
    return "";
  }
}

async function createRegistry(name: string, registryItem: RegistryItem): Promise<string> {
  try {
    const preReqPath = path.resolve(process.cwd(), `public/registry/${name}.json`);
    await fs.writeFile(preReqPath, JSON.stringify(registryItem, null, 2));
    return `${domain}/registry/${name}.json`;
  } catch (error) {
    console.error("Error creating the file: ", error);
    throw error;
  }
}

async function processRegistryItem(item: preReq, allItems: preReq[], processedItems: Set<string>): Promise<void> {
  if (processedItems.has(item.name)) {
    return;
  }

  const src = await hasSrcFolder();
  const filePath = path.resolve(process.cwd(), src, item.path);
  const fileContent = await fs.readFile(filePath, "utf-8");

  let registryDependencies: string[] = [];

  // Process registry dependencies first
  if (item.registryDependencies) {
    for (const depName of item.registryDependencies) {
      if (isUrl(depName)) {
        registryDependencies.push(`${depName}`);
      } else {
        const depItem = allItems.find(i => i.name === depName);
        if (depItem) {
          await processRegistryItem(depItem, allItems, processedItems);
          registryDependencies.push(`${domain}/registry/${depName}.json`);
        }
      }
    }
  }

  // Add UI dependencies as registry deps
  if (item.uiDependencies) {
    registryDependencies = [...registryDependencies , ...item.uiDependencies]
  }

  const registryItem: RegistryItem = {
    name: item.name,
    type: item.type,
    dependencies: item.dependencies,
    ...(item.devDependencies && { devDependencies: item.devDependencies }),
    registryDependencies,
    files: [
      {
        path: item.path,
        type: item.type,
        content: fileContent,
      },
    ],
    tailwind : item.tailwind,
    cssVars : item.cssVars,
    meta : item.meta,
    docs : item.docs,
  };

  await createRegistry(item.name, registryItem);
  processedItems.add(item.name);
}

async function main() {
  try {
    const preData = Registries;
    const processedItems = new Set<string>();
    const registryPath = path.join(process.cwd(), "public/registry");

    if (!fsync.existsSync(registryPath)) {
      fsync.mkdirSync(registryPath);
    }
    console.log("this shit exists : " , path.resolve(process.cwd(), "public/registry"))
    for (const item of preData) {
      await processRegistryItem(item as preReq, preData as preReq[], processedItems);
    }

    console.log("Registry creation completed successfully.");
  } catch (error) {
    console.error("Failed to process data:", error);
    console.error("If the issue persists, fire an issue on github");
  }
}

main();