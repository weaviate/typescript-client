import SchemaGetter from './getter.js';
import ClassDeleter from './classDeleter.js';
import Connection from '../connection/index.js';

export default async (client: Connection) => {
  const getter = new SchemaGetter(client);
  const schema = await getter.do();
  await Promise.all(
    schema.classes
      ? schema.classes.map((c) => {
          const deleter = new ClassDeleter(client);
          return deleter.withClassName(c.class as string).do();
        })
      : []
  );
};
