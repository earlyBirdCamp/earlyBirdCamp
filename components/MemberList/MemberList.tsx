import useSWR from 'swr';
import fetch from 'isomorphic-unfetch';
import { useCookie } from 'react-use';

function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

export default () => {
  const { data, error } = useSWR('/api/members/list', fetcher);

  const [userInfo] = useCookie('gh_user_info');
  const name = userInfo ? JSON.parse(userInfo).login : '';

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <div>
      <h2>Member List</h2>
      <ul>
        {data.map((member: any) => {
          return (
            <li
              key={member.name}
              className={member.name === name ? 'bg-orange-300' : ''}
            >
              <span className="mr-4 inline-block">name: {member.name}</span>
              <span className="mr-4 inline-block">hp: {member.hp}</span>
              <span className="mr-4 inline-block">
                joined_at: {member.joined_at}
              </span>
              <span className="mr-4 inline-block">
                articles: {member.articles.length}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
