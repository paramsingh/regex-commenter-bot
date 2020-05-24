# commenter-bot

regex-commenter is a GitHub App build with [probot](https://probot.github.io/) that monitors pull requests
and comments on them if the diff matches your given regular expressions.

For example, you could use it to ask for clarifications on each `pylint: disable` in all pull
requests to your repository.

## Configuration

[Install the app](https://github.com/apps/regex-commenter) and add a `regex-commenter-config.yaml` to the `.github` directory in your repository.

Here's an example configuration.

```yaml
defaults:
  # the default comment if the PR diff matches any of the given regexes
  comment: "please take a look, @paramsingh"

matches:
  # An optional description of the regular expression
- description: "Comments on each pylint-disable in the pull request"

  # The regular expression that regex-commenter should match the diff against
  regex: ".*pylint: disable*"

  # The comment that regex-commenter will make if the diff matches this regex,
  comment: "Please don't disable 'pylint' checks."

- regex: ".*DANGEROUSLY_do_something*"
  comment: "cc @ferbncode, dangerous code change"

- regex: ".*LOG_LEVEL=*" # no comment specified, uses default comment.
```

For more details, read the [documentation](https://regex-commenter.github.io).

## Development Setup

```sh
# Install dependencies
npm install

# Run with hot reload
npm run build:watch

# Compile and run
npm run build
npm run start
```

## Contributing

If you have suggestions for how regex-commenter-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).


## License

```
regex-commenter-bot
Copyright (C) 2020 Param Singh <iliekcomputers@gmail.com>
Copyright (C) 2020 Suyash Garg <ferbncode@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
