// import fs from 'fs';
// import weaviate, { toBase64FromMedia } from '../src/';

// describe('Journey testing of the image functionality', () => {
//   const collectionName = 'ImageJourneyTesting';

//   beforeAll(async () => {
//     const client = await weaviate.connectToLocal();
//     await client.collections.delete(collectionName);
//   });

//   it('should create a collection with an image property and capable vectorizer', async () => {
//     const client = await weaviate.connectToLocal();
//     await client.collections.create({
//       name: collectionName,
//       properties: [
//         {
//           name: 'image',
//           dataType: 'blob',
//         },
//       ],
//       vectorizers: weaviate.configure.vectorizer.img2VecNeural({
//         imageFields: ['image'],
//       }),
//     });
//   });

//   it('should insert an encoded image', async () => {
//     const client = await weaviate.connectToLocal();
//     await client.collections.get(collectionName).data.insert({
//       image: await toBase64FromMedia('./public/favicon.ico'),
//     });
//   });

//   it('should retrieve the encoded image', async () => {
//     const client = await weaviate.connectToLocal();
//     const res = await client.collections
//       .get(collectionName)
//       .query.fetchObjects({ returnProperties: ['image'] });
//     expect(res.objects[0].properties.image).toBeDefined();
//   });

//   it('should search on the encoded image vector with a file path string', async () => {
//     const client = await weaviate.connectToLocal();
//     const res = await client.collections.get(collectionName).query.nearImage('./public/favicon.ico');
//     expect(res.objects.length).toEqual(1);
//   });

//   it('should search on the encoded image vector with a buffer', async () => {
//     const client = await weaviate.connectToLocal();
//     const res = await client.collections
//       .get(collectionName)
//       .query.nearImage(fs.readFileSync('./public/favicon.ico')); // eslint-disable-line no-sync
//     expect(res.objects.length).toEqual(1);
//   });
// });
