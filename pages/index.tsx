import React from 'react';
import { useCookie } from 'react-use';
import useSWR from 'swr';
import UserInfo from '../components/UserInfo/UserInfo';
import MemberList from '../components/MemberList/MemberList';
import Join from '../components/Join/Join';

export default () => {
  const [token] = useCookie('gh_access_token');
  const [userInfo] = useCookie('gh_user_info');

  return (
    <div>
      <UserInfo />
      <br />
      <hr />
      <br />
      <Join />
      <br />
      <hr />
      <br />
      <MemberList />
    </div>
  );
};
