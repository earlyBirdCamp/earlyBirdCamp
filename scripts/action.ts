import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Octokit } from '@octokit/rest';
import dayjs from 'dayjs';

type IssueId = number;

interface Member {
  name: string;
  hp: number;
  articles: IssueId[];
  wechat_id?: string;
  joined_at: number;
  blocked_at?: number;
}

interface Data {
  members: Member[];
}

const INITIAL_HP = 14;
const DAY_TIME = 24 * 60 * 60 * 1000;
const now = dayjs();
const pathToData = join(
  __dirname,
  '..',
  'data',
  now.format('YYYY-MM-DD') + '.json',
);
const pathToLatestData = join(__dirname, '..', 'data', 'latest.json');

const octokit = new Octokit({
  auth: process.env.LEARN_GH_TOKEN,
  userAgent: 'earlyBirdCamp',
});

async function getData() {
  const org = 'earlyBirdCamp';
  const data: Data = JSON.parse(readFileSync(pathToLatestData, 'utf-8'));

  // 补充新增的 member
  const members = await octokit.paginate(octokit.orgs.listMembers, {
    org,
  });
  members.forEach((member) => {
    const { login: name } = member;
    // 当 sorrycc 被踢的时候，启用备用管理员，不算在 member 里
    if (name === 'yuelechen') return;
    if (!findMember(data.members, name)) {
      data.members.push({
        name,
        hp: 14,
        articles: [],
        joined_at: now.toDate().getTime(),
      });
    }
  });

  // 分析文章
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner: org,
    repo: 'articles',
  });
  console.log();
  console.log('Articles:');
  const memberArticles = issues.reduce((memo, issue) => {
    const name = issue.user.login;
    console.log(`[#${issue.number}] [${issue.user.login}] ${issue.title}`);
    if (!memo[name]) memo[name] = [];
    memo[name].push(issue.number);
    return memo;
  }, {});
  console.log('total:', issues.length);
  console.log();

  // HP 计算
  console.log('HP:');
  await Promise.all(data.members.map(async (member) => {
    const days = dayDiff(member.joined_at);
    // 一天减 1 滴 HP
    member.hp = INITIAL_HP - days;

    const articles: number[] = memberArticles[member.name] || [];
    member.articles = articles;

    // 每篇文章加 7 滴 HP
    member.hp += articles.length * 7;

    // 👍 附加分计算
    const votes = articles.length === 0 
      ? 0 
      : ((await Promise.all(
        articles.map(async issue_number => {
          const reactions = await octokit.paginate(octokit.reactions.listForIssue, {
            owner: org,
            repo: 'articles',
            issue_number,
            content: '+1',
          });

          return reactions.length >= 7 ? 7 : 0;
        })
      )) as number[])
      .reduce((prev, next) => prev + next);
    // 文章 👍 7 次或以上加 7 滴 HP（一篇文章只能加一次）
    member.hp += votes;

    console.log(
      `[${member.name}] 14 + 7 * ${articles.length} + ${votes} - ${days} = ${member.hp}`,
    );

    // TODO: HP 减为 0 时，移出 org
    if (member.hp <= 0) {
    }
  }));
  console.log();

  return data;
}

getData()
  .then((data) => {
    return JSON.stringify(data, null, 2);
  })
  .then((data) => {
    writeFileSync(pathToData, data, 'utf-8');
    writeFileSync(pathToLatestData, data, 'utf-8');
  })
  .catch((e) => {
    console.error(e);
  });

function fileString(ts: Date) {
  const year = ts.getUTCFullYear();
  const month = (ts.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = ts.getUTCDate().toString().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function findMember(members: Member[], name: string) {
  for (const member of members) {
    if (member.name === name) {
      return member;
    }
  }
  return null;
}

function dayDiff(date: number) {
  return Math.floor((now.endOf('day').toDate().getTime() - date) / DAY_TIME);
}
