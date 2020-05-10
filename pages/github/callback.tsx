import { useEffect, useState } from 'react';
import queryString from 'query-string';
import fetch from 'isomorphic-unfetch';
import { useCookie } from 'react-use';

export default () => {
  const [state, setState] = useState('正在登录早鸟营...');
  const [token, updateToken] = useCookie('gh_access_token');

  useEffect(() => {
    (async () => {
      const parsed = queryString.parse(location.search);
      if (parsed.code) {
        const { data } = await fetch(
          `/api/github/callback?code=${parsed.code}`,
        ).then((res) => res.json());
        console.log('data', data);
        if (data && data.access_token) {
          updateToken(data.access_token);
          location.href = '/';
        }
      }
    })();
  }, []);

  return <div>{state}</div>;
};
