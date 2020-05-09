import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query;
  const data = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  }).then((res) => res.json());
  console.log('data', data);
  res.status(200).json({
    data,
  });
};
