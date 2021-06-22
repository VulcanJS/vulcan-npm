import { getMdxPaths } from '../../mdx/index';

describe("vulcan/mdx/recursiveMdx", () => {
    test("Access nested files", async () => {
        const files = await getMdxPaths('packages/mdx/test')
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
