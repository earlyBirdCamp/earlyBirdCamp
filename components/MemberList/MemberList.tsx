import React from 'react';
import { useCookie } from 'react-use';
import { format } from 'timeago.js';

export default (props: { members: any[] }) => {
  const [userInfo] = useCookie('gh_user_info');
  const userInfoObj =
    userInfo && userInfo !== 'undefined' ? JSON.parse(userInfo) : {};

  return (
    <div className="px-2 py-8 flex flex-col content-center flex-wrap bg-blue-100 shadow-inner">
      <div className="text-gray-700 lg:w-1/2 sm:w-3/4">
        <h2 className="text-xl mb-3">成员列表（TOP 100）</h2>
        <div>
          <div className="mb-2 flex flex-wrap flex-row font-bold text-gray-500">
            <div className="flex-1">Github 信息</div>
            <div className="w-1/4 sm:w-20 text-right">HP</div>
            <div className="w-1/4 sm:w-40 hidden sm:block text-right">
              加入时间
            </div>
            <div className="w-1/4 sm:w-20 text-right">文章数</div>
          </div>
          {props.members
            .sort((a, b) => {
              return a.hp > b.hp ? -1 : 1;
            })
            .slice(0, 100)
            .map((member: any, index) => {
              const itsYou = member.name === userInfoObj.login;
              return (
                <div
                  key={member.name}
                  className={`mb-1 flex flex-wrap flex-row ${
                    itsYou ? 'bg-gray-300' : ''
                  }`}
                >
                  <div className="flex-1">
                    <a
                      href={`https://github.com/${member.name}`}
                      target="_blank"
                    >
                      {member.name}
                    </a>
                    {itsYou ? (
                      <span className="ml-2 text-red-500">← 这是你</span>
                    ) : null}
                  </div>
                  <div className="w-1/4 sm:w-20 text-right">{member.hp}</div>
                  <div className="w-1/4 sm:w-40 hidden sm:block text-right">
                    {format(member.joined_at)}
                  </div>
                  <div className="w-1/4 sm:w-20 text-right">
                    {member.articles.length}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
