export async function findExamples(req: any, res: any) {
  res.json([
    {
      name: 'My example',
      tag: 'tag'
    }
  ]);
}
