import Connection from '../../connection/index.js';
import ClassDeleter from './classDeleter.js';
import SchemaGetter from './getter.js';

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
