const BOT_NAME = 'regex-commenter[bot]';

// TODO: make it clear in the docs that the pattern is taken as a JS string
const matchesPattern = (pattern, text) => {
  const regex = new RegExp(pattern);
  return !!text.match(regex)
};

const getBotComments = async (github, owner, repo, pullNumber) => {
  // FIXME: pagination
  const allComments = await github.pulls.listComments({
    owner,
    repo,
    number: pullNumber
  })

  return allComments.data.filter((comment) => {
    return comment.user.login === BOT_NAME
  })
}

const commentAlreadyExists = (comments, position, potentialCommentText) => {
  return !!comments.find((comment) => {
    return comment.position === position && comment.body === potentialCommentText;
  })
}


module.exports = (app) => {
  app.log.info("App started!!");
  app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async context => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.pull_request.number;
    const commitId = context.payload.pull_request.head.sha;

    const config = await context.config('config.yaml');

    const files = await context.github.pulls.listFiles({
        owner,
        repo,
        number: pullNumber,
        mediaType: {
          format: "diff",
        },
    });

    const botComments = await getBotComments(
      context.github,
      owner,
      repo,
      pullNumber
    )

    // TODO: check that we haven't already commented
    // TODO: Might not be fetching ALL the files because of pagination
    files.data.forEach((file) => {
      const patch = file.patch;

      // if it is an empty file, patch is undefined
      if (!file.patch) {
        return;
      }

      let position = 0;
      patch.split("\n").forEach((line) => {
        if (line.startsWith("+")) {
          const addedLine = line.slice(1); // doing this to remove the + from the diff

          // get each pattern from the config and try to match.
          const matches = config.matches;
          matches.forEach((match) => {
            // default to default comment if match doesn't have an associated comment
            const commentText = match.comment ? match.comment : config.defaults.comment;

            if (matchesPattern(match.regex, addedLine) && !commentAlreadyExists(botComments, position, commentText)) {
              app.log("Commenting " + commentText + " on line " + position)
              context.github.pulls.createComment({
                owner,
                repo,
                number: pullNumber,
                commit_id: commitId,
                position,
                path: file.filename,

                body: commentText,
              });
            }
          })
        }
        position += 1;
      })
    })
  })
}
