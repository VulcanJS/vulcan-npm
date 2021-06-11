import { promises as fsPromises } from "fs";
import path from "path";

type MdxPath = {
  params: {
    fileName: Array<String>
  }
}

/**
 * Get all MD/MDX files paths on a folder and his subfolder.
 * Returns an array of {params: {fileName: [ 'exampleSubFolder', 'exampleFile' ]}
 */
export async function getMdxPaths(docsDir: string) {
   // relative to the project root
  const fullPath = path.resolve(docsDir);
  let paths: MdxPath[] = [];
  for await (const f of getFiles(fullPath)) {
  //process paths
    const fParsed = path.parse(f);
    if(fParsed.ext.match(/.mdx?$/)) {
      const relativePath = f.replace(fullPath, "");
      let pathArgs: Array<String> = relativePath.split(path.sep);
      pathArgs.shift();
      if(fParsed.name === "index") {
        pathArgs.pop();
      } else {
        pathArgs[pathArgs.length - 1] = fParsed.name; 
      }
      paths.push({params: {fileName: pathArgs}})
    }
  }
  return paths;
}

/**
 * Generator returning paths of all files in the folder and its subfolders
 */
export async function* getFiles(dir: string) {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      //do something to get the path link
      yield res
    }
  }
}


/**
 * extract the first header out of the mdx to use for autogeneration of head tags
 */
export function getFirstHeader(mdText) {
  return mdText.match(/^<.+?>(.+?)<.+?>/)?.[1];
}

export async function getSource(docFolder: string, fileNames: [string]) {
  const fullPath = path.resolve(docFolder, ...fileNames)
  let isFolder: boolean;
  try {
    await fsPromises.access(fullPath);
    isFolder = true;
  } catch {
    isFolder = false;
  }
  const filePath = (isFolder)?path.resolve(fullPath, "index.md"): fullPath + ".md";
  const source = await fsPromises.readFile(filePath, { encoding: "utf8" });
  return { filePath, source }
}