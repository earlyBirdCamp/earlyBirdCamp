import React, { useEffect, useState } from 'react';
import { useCookie } from 'react-use';
import { pick } from 'lodash';
import { CLIENT_ID, MEMBER_COUNT_LIMIT } from '../../constants/constants';
import fetch from 'isomorphic-unfetch';

async function jsonFetch(url: string) {
  return await fetch(url).then((res) => res.json());
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default (props: { members: any[] }) => {
  const [token, updateToken, deleteToken] = useCookie('gh_access_token');
  const [userInfo, updateUserInfo, deleteUserInfo] = useCookie('gh_user_info');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [status, setStatus] = useState('');
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

        // TODO: 处理 page 里 cookie 的同步问题
        location.reload();
      }
    })();
  }, []);

  const userInfoObj =
    userInfo && userInfo !== 'undefined' ? JSON.parse(userInfo) : {};
  const isMember =
    userInfoObj.login &&
    props.members.some((member) => {
      return member.name === userInfoObj.login;
    });

  function logoutHandler() {
    deleteToken();
    deleteUserInfo();
    location.reload();
  }

  async function joinHandler() {
    setStatus('正在检查是否已加入...');
    const {
      data: { exists, blocked, membersCount },
    } = await jsonFetch('/api/github/memberStatus');
    if (blocked) {
      setStatus('加入失败，你已退出该组织。');
      setJoinSuccess(true);
      return;
    }
    if (exists) {
      setStatus('加入失败，你已是该组织成员。');
      setJoinSuccess(true);
      return;
    }

    setStatus('正在检查成员数...');
    await delay(800);
    if (membersCount > MEMBER_COUNT_LIMIT) {
      setStatus('加入失败，成员暂时已满。');
      return;
    }

    setStatus('正在尝试加入...');
    const { data: jsonStatus } = await jsonFetch('/api/github/join');
    setStatus(jsonStatus ? '👍，加入成功！' : '加入失败');
    if (jsonStatus) {
      setJoinSuccess(true);
    }
  }

  return (
    <div className="py-8 px-2">
      <div className="flex flex-row content-center items-center">
        <div className="font-bold text-orange-700 flex flex-row flex-wrap content-center items-center text-center mx-auto">
          {token ? (
            userInfoObj.login ? (
              status ? (
                <div>{status}</div>
              ) : (
                <>
                  <span>
                    Hi, {userInfoObj.login}
                    {isMember ? '，你已是早鸟营成员' : ''}
                    ！你可以选择
                  </span>
                  {isMember ? null : (
                    <>
                      <button
                        className="btn btn-orange mx-1"
                        onClick={joinHandler}
                      >
                        加入早鸟营
                      </button>
                      <span>或</span>
                    </>
                  )}
                  <button className="btn btn-gray mx-1" onClick={logoutHandler}>
                    退出登录
                  </button>
                  <span>。</span>
                </>
              )
            ) : (
              <div>正在获取用户信息...</div>
            )
          ) : (
            <>
              <svg
                className="inline-block mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  className="heroicon-ui"
                  d="M16.21 16.95a5 5 0 0 1-4.02 4.9l-3.85.77a1 1 0 0 1-.9-.27l-.71-.7a2 2 0 0 1 0-2.83l1.44-1.45a13.17 13.17 0 0 1-1.42-1.41L5.31 17.4a2 2 0 0 1-2.83 0l-.7-.7a1 1 0 0 1-.28-.9l.77-3.86a5 5 0 0 1 4.9-4.02h.86a13.07 13.07 0 0 1 12.82-5.47 1 1 0 0 1 .83.83A12.98 12.98 0 0 1 16.2 16.1v.85zm-4.41 2.94a3 3 0 0 0 2.41-2.94v-1.4a1 1 0 0 1 .47-.84A11.04 11.04 0 0 0 19.8 4.33 10.98 10.98 0 0 0 9.42 9.45a1 1 0 0 1-.85.47h-1.4a3 3 0 0 0-2.94 2.4l-.66 3.34.33.33 2.24-2.24a1 1 0 0 1 1.52.12 11.08 11.08 0 0 0 2.6 2.6 1 1 0 0 1 .12 1.52l-2.24 2.24.33.33 3.33-.67zM15 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
                />
              </svg>
              <span>要加入或查看自己的 HP 信息，请先</span>
              <a className="btn btn-orange mx-1" href={loginUrl}>
                通过 Github 登录
              </a>
              <span>。</span>
            </>
          )}
        </div>
      </div>
      {joinSuccess || isMember ? (
        <div className="mt-8 mb-5 leading-loose flex flex-col content-center flex-wrap">
          <div className="text-gray-700 lg:w-1/2 sm:w-3/4">
            接下来，你可以：
            <br />
            1. 访问{' '}
            <a
              target="_blank"
              href="https://github.com/orgs/earlyBirdCamp/invitation"
            >
              orgs/earlyBirdCamp/invitation
            </a>{' '}
            接受邀请，接受后才算正式加入，并开始计时扣 HP
            <br />
            2. 阅读
            <a
              href="https://github.com/earlyBirdCamp/earlyBirdCamp/issues/1"
              target="_blank"
            >
              《早鸟营详细规则》
            </a>
            <br />
            3. 访问
            <a
              href="https://github.com/earlyBirdCamp/articles/issues"
              target="_blank"
            >
              文章区
            </a>
            开始写文章（FAQ：如遇 404 错误，先接受邀请）
            <br />
            4. 扫码添加 UmiJS 小助手，并回复 <strong>earlyBirdCamp</strong>{' '}
            加交流群
            <img
              src="https://img.alicdn.com/tfs/TB1pd1ce8r0gK0jSZFnXXbRRXXa-430-430.jpg"
              width="100"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
