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
  try {
    await octokit.orgs.addOrUpdateMembership({
      org: 'earlyBirdCamp',
      username: name as string,
      role: 'member',
    });
    res.status(200).json({
      data: true,
    });
  } catch (e) {
    res.status(200).json({
      data: false,
    });
  }
};
