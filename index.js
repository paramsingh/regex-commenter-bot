const regexes = ['.*pylint: disable*']

const matches = (pattern, text) => {
  const regex = new RegExp(pattern);
  return !!text.match(regex)
};

module.exports = (app) => {

    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async context => {
        const owner = context.payload.repository.owner.login;
        const repo = context.payload.repository.name;
        const pullNumber = context.payload.pull_request.number;
        const commitId = context.payload.pull_request.head.sha;

        const files = await context.github.pulls.listFiles({
            owner,
            repo,
            number: pullNumber,
            mediaType: {
              format: "diff",
            },
        });

        files.data.forEach((file) => {
          const patch = file.patch;
          let position = 0;
          patch.split("\n").forEach((line) => {
            if (line.startsWith("+")) {
              regexes.forEach((regex) => {
                if (matches(regex, line)) {
                  context.github.pulls.createComment({
                    owner,
                    repo,
                    number: pullNumber,
                    commit_id: commitId,
                    position,
                    path: file.filename,
                    body: "this is a comment"
                  });
                }
              })
            }
            position += 1;
          })
        })
    })
}
