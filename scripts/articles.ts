import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.LEARN_GH_TOKEN,
  userAgent: 'earlyBirdCamp',
});

async function getData() {
  const org = 'earlyBirdCamp';

  // 分析文章
  console.log('Get articles');
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner: org,
    repo: 'articles',
  });
  console.log();
  console.log('Articles:');
  for (const issue of issues) {
    const name = issue.user.login;
    const { labels } = issue;

    // WIP 阶段的文章不计分。
    if (labels && labels.some((label) => label.name === 'WIP')) {
      continue;
    }

    // 加过 label 的不再加
    if (labels && labels.some((label) => label.name === 'HP +7')) {
      continue;
    }

    const { data: reactions } = await octokit.reactions.listForIssue({
      owner: org,
      repo: 'articles',
      issue_number: issue.number,
      content: '+1',
    });
    console.log(
      `[#${issue.number}] [+${reactions.length}] [${issue.user.login}] ${issue.title}`,
    );
    if (reactions.length >= 7) {
      await octokit.issues.addLabels({
        owner: org,
        repo: 'articles',
        issue_number: issue.number,
        labels: ['HP +7'],
      });
    }
  }

  console.log();
}

getData().catch((e) => {
  console.error(e);
});
