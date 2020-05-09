import { useEffect } from 'react';
import { useCookie } from 'react-use';
import { pick } from 'lodash';
import { CLIENT_ID } from '../../constants/constants';

export default () => {
  const [token, updateToken, deleteToken] = useCookie('gh_access_token');
  const [userInfo, updateUserInfo, deleteUserInfo] = useCookie('gh_user_info');
  const loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`;

  useEffect(() => {
    (async () => {
      if (token && !userInfo) {
        const { data } = await fetch(
          `/api/github/userInfo?token=${token}`,
        ).then((res) => res.json());
        if (!data.login) {
          alert('获取用户信息失败');
          return;
        }
        updateUserInfo(
          JSON.stringify(pick(data, ['login', 'id', 'name', 'email'])),
        );
      }
    })();
  }, []);

  const userInfoObj =
    userInfo && userInfo !== 'undefined' ? JSON.parse(userInfo) : {};

  function logoutHandler() {
    deleteToken();
    deleteUserInfo();
    location.reload();
  }

  return (
    <div>
      {token ? (
        userInfoObj.login ? (
          <div>
            <span>Hi, {userInfoObj.login}</span>
            <button onClick={logoutHandler}>Logout</button>
          </div>
        ) : (
          <div>Getting user info...</div>
        )
      ) : (
        <a className="btn btn-blue btn-blue-hover" href={loginUrl}>
          通过 Github 登录
        </a>
      )}
    </div>
  );
};
