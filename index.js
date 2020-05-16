// TODO: make it clear in the docs that the pattern is taken as a JS string
const matchesPattern = (pattern, text) => {
  const regex = new RegExp(pattern);
  return !!text.match(regex)
};

module.exports = (app) => {
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
            console.error(addedLine);
            if (matchesPattern(match.regex, addedLine)) {
              context.github.pulls.createComment({
                owner,
                repo,
                number: pullNumber,
                commit_id: commitId,
                position,
                path: file.filename,

                // default to default comment if match doesn't have an associated comment
                body: match.comment ? match.comment : config.defaults.comment
              });
            }
          })
        }
        position += 1;
      })
    })
  })
}
