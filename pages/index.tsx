import React, { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import UserInfo from '../components/UserInfo/UserInfo';
import MemberList from '../components/MemberList/MemberList';

export default () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/members/list').then((res) => res.json());
      setMembers(data.members);
    })();
  }, []);

  return (
    <div>
      <div className="px-2">
        <div className="flex flex-col content-center flex-wrap mb-2">
          <div className="flex flex-col content-center flex-wrap">
            <img
              src="https://img.alicdn.com/tfs/TB1cCrxFCf2gK0jSZFPXXXsopXa-289-285.jpg"
              width="100"
            />
          </div>
          <div className="text-center text-3xl font-sans my-5">
            EarlyBirdCamp（早鸟营）
          </div>
        </div>
        <div className="flex flex-col content-center flex-wrap">
          <div className="text-gray-700 lg:w-1/2 sm:w-3/4">
            Hi！这是一个机器人管理的前端小社群，希望能通过
            <a
              href="https://github.com/earlyBirdCamp/earlyBirdCamp/issues/1"
              target="_blank"
            >
              “有趣”的类游戏规则
            </a>
            逼自己养成每周写一篇前端文章的习惯，目前已有{' '}
            <strong className="text-orange-700">
              {members.length || '...'}
            </strong>{' '}
            人加入（起步阶段，暂限 100 人）。
            <strong>
              初始 HP 为 14，每写一篇 +7，每天 -1，HP 为 0 时退群。
            </strong>
            如果你和我们一样，想写文章又没人监督，不妨一试。
          </div>
        </div>
      </div>
      {/*<div className="text-center my-8">*/}
      {/*  <div className="bg-yellow-400 text-3xl font-bold text-red-900 mb-4">*/}
      {/*    今天加入的人较多，被 GitHub 限制邀请了，感兴趣的同学请明天再试。*/}
      {/*  </div>*/}
      {/*  <img*/}
      {/*    src="https://img.alicdn.com/tfs/TB1wmcdFy_1gK0jSZFqXXcpaXXa-566-328.png"*/}
      {/*    width="400"*/}
      {/*    className="inline-block"*/}
      {/*  />*/}
      {/*</div>*/}
      {members.length === 0 ? (
        <div className="text-center font-bold mt-8 text-orange-700">
          Loading...
        </div>
      ) : (
        <>
          <UserInfo members={members} />
          <MemberList members={members} />
        </>
      )}
    </div>
  );
};
