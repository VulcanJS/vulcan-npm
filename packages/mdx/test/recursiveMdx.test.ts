import { getMdxPaths } from '../../mdx';

describe("vulcan/mdx/recursiveMdx", () => {
    test("Access nested files", async () => {
        const files = await getMdxPaths('packages/mdx/test')
        console.log("\n\n\n\n\n\n\n >>> FILES : ", files);
        expect(files).toHaveLength(4);       
    });
    test("Path of index.md correct", async () => {
        const files = await getMdxPaths('packages/mdx/test')
        expect(files).toContainEqual(
                expect.objectContaining({params: {fileName: [ 'folder' ]}})
        )
        expect(files).not.toContainEqual(
                expect.objectContaining({params: {fileName: [ 'folder', 'index' ]}})
        )
    });
});
