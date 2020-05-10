import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';
import cookie from 'cookie';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { gh_user_info } = cookie.parse(req.headers.cookie || '');
  const { login: name } = JSON.parse(gh_user_info);
  const octokit = new Octokit({
    auth: process.env.LEARN_GH_TOKEN,
    userAgent: 'earlyBirdCamp',
  });
  const members = await octokit.paginate(octokit.orgs.listMembers, {
    org: 'earlyBirdCamp',
  });
  const exists = members.some((member) => {
    return member.login === name;
  });
  res.status(200).json({
    data: { exists, name, membersCount: members.length },
  });
};
