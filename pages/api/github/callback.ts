import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import queryString from 'query-string';
import { CLIENT_ID, CLIENT_SECRET } from '../../../constants/constants';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code } = req.query;
  const body = new URLSearchParams();
  body.append('client_id', CLIENT_ID);
  body.append('client_secret', CLIENT_SECRET);
  body.append('code', code as string);
  const data = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body,
  }).then((res) => res.text());
  res.status(200).json({
    data: queryString.parse(data),
  });
};
