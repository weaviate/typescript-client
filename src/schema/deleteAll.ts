import Connection from '../connection';
import ClassDeleter from './classDeleter';
import SchemaGetter from './getter';

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
