import { useCookie } from 'react-use';

export default () => {
  const [userInfo] = useCookie('gh_user_info');

  if (!userInfo) {
    return null;
  }

  function joinHandler() {
    alert('TODO');
  }

  return (
    <div>
      <h2>JOIN</h2>
      <button className="btn btn-blue btn-blue-hover" onClick={joinHandler}>
        加入
      </button>
    </div>
  );
};
