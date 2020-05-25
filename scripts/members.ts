import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Octokit } from '@octokit/rest';
import dayjs from 'dayjs';

type IssueId = number;

interface Member {
  name: string;
  hp: number;
  articles: IssueId[];
  greatArticles: IssueId[];
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
  console.log('Get members');
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
        greatArticles: [],
        joined_at: now.toDate().getTime(),
      });
    }
  });

  // 分析文章
  console.log('Get articles');
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner: org,
    repo: 'articles',
  });
  console.log();
  console.log('Articles:');
  const memberArticles = issues.reduce((memo, issue) => {
    const name = issue.user.login;
    const { labels } = issue;

    // WIP 阶段的文章不计分。
    if (labels && labels.some((label) => label.name === 'WIP')) {
      return memo;
    }

    console.log(`[#${issue.number}] [${issue.user.login}] ${issue.title}`);
    if (!memo[name]) memo[name] = { articles: [], greatArticles: [] };
    memo[name].articles.push(issue.number);

    if (labels && labels.some((label) => label.name === 'HP +7')) {
      memo[name].greatArticles.push(issue.number);
    }

    return memo;
  }, {});
  console.log('total:', issues.length);
  console.log();

  // HP 计算
  console.log('HP:');
  for (const member of data.members) {
    const days = dayDiff(member.joined_at);
    // 一天减 1 滴 HP
    member.hp = INITIAL_HP - days;

    const { articles = [], greatArticles = [] } =
      memberArticles[member.name] || {};
    member.articles = articles;
    member.greatArticles = greatArticles;
    // 每篇文章加 7 滴 HP
    member.hp += articles.length * 7;
    // 每篇好文再加 7 滴 HP
    member.hp += greatArticles.length * 7;
    console.log(
      `[${member.name}] 14 + 7 * ${articles.length} + 7 * ${greatArticles.length} - ${days} = ${member.hp}`,
    );

    // HP 减为 0 时，移出 org
    if (member.hp <= 0 && !member.blocked_at) {
      console.log(`[${member.name}] remove from org`);
      try {
        await octokit.orgs.removeMember({
          org,
          username: member.name,
        });
      } catch (e) {
        console.error(`[${member.name}] remove from org failed: ${e}`);
      }
      member.blocked_at = now.toDate().getTime();
    }
  }
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
