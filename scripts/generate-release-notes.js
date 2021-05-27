const _ = require('lodash/fp');
const axios = require('axios');
const git = require('simple-git/promise');

main();

async function main() {
  let latestVersion;
  let version = 'HEAD';

  if (process.argv.length === 4) {
    latestVersion = process.argv[2];
    version = process.argv[3];
  }

  // set latestVersion to most recent tag, excluding prereleases
  if (!latestVersion || latestVersion.match(/-\d+$/)) {
    latestVersion = await git()
      .tags({ '--sort': '-creatordate' })
      .then(d => d.all)
      // filter out prereleases
      .then(tags => tags.find(d => !d.match(/-\d+$/)));
  }

  // get commits since latest tag
  let commits;

  try {
    // first try the specific version references
    commits = await git()
      .log({ from: latestVersion, to: version })
      .then(d => d.all)
      .catch(_ => {});

    // then try latestVersion..HEAD
    commits =
      commits ||
      (await git()
        .log({ from: latestVersion, to: 'HEAD' })
        .then(d => d.all));
  } catch (err) {
    console.error(err);
    // get all commits
    commits = await git()
      .log()
      .then(d => d.all);
  }

  // get clubhouse story ids from commits
  const clubhouseStoryIds = _.flow(
    _.map(commit => commit.message.match(/(?<=ch)\d+/gi)),
    _.filter(d => d !== null),
    _.flatten,
    _.uniq
  )(commits);

  // get story objects from clubhouse api
  const clubhouseStories = await Promise.all(
    clubhouseStoryIds.map(fetchClubhouseStory)
  )
    .then(_.orderBy(['estimate', 'updated_at'], ['desc', 'desc']))
    .then(_.groupBy('story_type'));

  // write final release notes
  const storyToString = story => {
    let output = `- [[ch${story.id}]](${story.app_url}) ${story.name}`;

    story.external_links.forEach((url, i) => {
      if (url) output += ` [[${i + 1}]](${url})`;
    });

    return output;
  };

  if (clubhouseStories.feature) {
    process.stdout.write('### ✨ Features\n');
    clubhouseStories.feature
      .map(storyToString)
      .forEach(str => process.stdout.write(str + '\n'));
    process.stdout.write('\n');
  }

  if (clubhouseStories.bug) {
    process.stdout.write('### 🐛 Bug fixes\n');
    clubhouseStories.bug
      .map(storyToString)
      .forEach(str => process.stdout.write(str + '\n'));
    process.stdout.write('\n');
  }

  if (clubhouseStories.chore) {
    process.stdout.write('### 🛠️ Chores\n');
    clubhouseStories.chore
      .map(storyToString)
      .forEach(str => process.stdout.write(str + '\n'));
    process.stdout.write('\n');
  }

  // and the rest
  const untaggedCommits = commits.filter(
    commit => !commit.message.match(/(?<=ch)\d+/gi)
  );

  if (untaggedCommits.length > 0) {
    process.stdout.write('### 🏷️ Untagged\n');
    untaggedCommits
      .map(d => `- ${d.hash.slice(0, 7)} ${d.message}`)
      .forEach(str => process.stdout.write(str + '\n'));
    process.stdout.write('\n');
  }
}

async function fetchClubhouseStory(id) {
  return await axios
    .get(`https://api.clubhouse.io/api/v3/stories/${id}`, {
      params: { token: process.env.CLUBHOUSE_API_TOKEN },
    })
    .then(res => res.data);
}
