import { getUserById } from '@repro/data';

export default async function Home() {
  const user = await getUserById('xxx');
  return <div>{user?.email ?? 'no user'}</div>;
}
