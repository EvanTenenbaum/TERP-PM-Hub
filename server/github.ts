import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "EvanTenenbaum";
const REPO_NAME = "TERP";
const PM_BASE_PATH = "product-management";

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export interface GitHubFile {
  path: string;
  content: string;
  sha: string;
}

/**
 * Get file content from GitHub
 */
export async function getFileContent(path: string): Promise<GitHubFile | null> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    });

    if ("content" in response.data && response.data.type === "file") {
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      return {
        path: response.data.path,
        content,
        sha: response.data.sha,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to get file ${path}:`, error);
    return null;
  }
}

/**
 * List files in a directory
 */
export async function listDirectory(path: string): Promise<Array<{ name: string; path: string; type: string }>> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
      }));
    }

    return [];
  } catch (error) {
    console.error(`Failed to list directory ${path}:`, error);
    return [];
  }
}

/**
 * Get all PM items from GitHub
 */
export async function getAllPMItems() {
  const items: any[] = [];

  // Get features
  const featureStatuses = ["inbox", "backlog", "planned", "in-progress", "completed", "archived"];
  for (const status of featureStatuses) {
    const path = `${PM_BASE_PATH}/features/${status}`;
    const dirs = await listDirectory(path);

    for (const dir of dirs) {
      if (dir.type === "dir") {
        const metadataPath = `${dir.path}/metadata.json`;
        const metadata = await getFileContent(metadataPath);

        if (metadata) {
          try {
            const data = JSON.parse(metadata.content);
            items.push({
              ...data,
              githubPath: dir.path,
              status,
            });
          } catch (e) {
            console.error(`Failed to parse metadata for ${dir.path}:`, e);
          }
        }
      }
    }
  }

  // Get ideas
  const ideasPath = `${PM_BASE_PATH}/ideas/inbox`;
  const ideaDirs = await listDirectory(ideasPath);

  for (const dir of ideaDirs) {
    if (dir.type === "dir") {
      const metadataPath = `${dir.path}/metadata.json`;
      const metadata = await getFileContent(metadataPath);

      if (metadata) {
        try {
          const data = JSON.parse(metadata.content);
          items.push({
            ...data,
            githubPath: dir.path,
            status: "inbox",
          });
        } catch (e) {
          console.error(`Failed to parse metadata for ${dir.path}:`, e);
        }
      }
    }
  }

  // Get bugs
  const bugStatuses = ["open", "in-progress", "resolved"];
  for (const status of bugStatuses) {
    const path = `${PM_BASE_PATH}/bugs/${status}`;
    const dirs = await listDirectory(path);

    for (const dir of dirs) {
      if (dir.type === "dir") {
        const metadataPath = `${dir.path}/metadata.json`;
        const metadata = await getFileContent(metadataPath);

        if (metadata) {
          try {
            const data = JSON.parse(metadata.content);
            items.push({
              ...data,
              githubPath: dir.path,
              status,
            });
          } catch (e) {
            console.error(`Failed to parse metadata for ${dir.path}:`, e);
          }
        }
      }
    }
  }

  return items;
}

/**
 * Get ID registry
 */
export async function getIDRegistry() {
  const registryPath = `${PM_BASE_PATH}/_system/id-registry.json`;
  const file = await getFileContent(registryPath);

  if (file) {
    try {
      return JSON.parse(file.content);
    } catch (e) {
      console.error("Failed to parse ID registry:", e);
      return { ids: [] };
    }
  }

  return { ids: [] };
}

/**
 * Get codebase snapshot
 */
export async function getCodebaseSnapshot() {
  const snapshotPath = `${PM_BASE_PATH}/codebase/snapshot.json`;
  const file = await getFileContent(snapshotPath);

  if (file) {
    try {
      return JSON.parse(file.content);
    } catch (e) {
      console.error("Failed to parse codebase snapshot:", e);
      return null;
    }
  }

  return null;
}

/**
 * Get chat context file
 */
export async function getChatContext(agentType: "inbox" | "planning" | "qa") {
  const contextPath = `${PM_BASE_PATH}/_system/chat-contexts/${agentType}-context.md`;
  const file = await getFileContent(contextPath);

  return file?.content || "";
}
