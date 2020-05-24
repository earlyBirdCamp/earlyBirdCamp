import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await fetch(
    'https://raw.githubusercontent.com/earlyBirdCamp/earlyBirdCamp/master/data/latest.json',
  ).then((res) => res.json());
  res.status(200).json({
    members: data.members.filter((member: any) => {
      return !member.blocked_at;
    }),
  });
};
