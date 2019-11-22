# Contributing

Once you've cloned this repo and followed the steps in [quick start](../README.md#getting-started) you'll be eager to start contributing code. Here are a few notes about how to do that once you've made edits and you're happy with the results.

## Commiting

This repo uses a commit convention.

```
    fix: correct handling of explorer links
```

The first part of this is the commit "type". The most common types are "feat" for new features, and "fix" for bugfixes. Using these commit types helps us correctly manage our version numbers and changelogs. Since our release process calculates new version numbers from our commits it is very important to get this right.

* `feat` is for introducing a new feature
* `fix` is for bug fixes
* `docs` for documentation only changes
* `style` is for code formatting only
* `refactor` is for changes to code which should not be detectable by users or testers
* `test` is for changes which only touch test files or related tooling
* `build` is for changes which only touch our develop/release tools

 Please ask questions if you're in doubt about the right prefix to use.

After the type and scope there should be a colon.

The "subject" of the commit follows. It should be a short indication of the change. The commit convention prefers that this is written in the present-imperative tense.

### Commitizen

To help with meeting this spec we've installed a [commitizen](http://commitizen.github.io/cz-cli/) adapter. To try it out install commitizen with `npm install -g commitizen` and then run it by usiung `git cz` instead of `git commit`. Commitizen takes all the normal arguments you'd expect for `git commit`

### Commit linting

Each time you commit the message will be checked against these standards in a pre-commit hook. Additionally all the commits in a PR branch will be linted before it can be merged to master. So don't worry - the :robot: has your back.

### Prettification

When you commit all the files you touch in your work will be run through `prettier` so that you don't have to worry about whitespace and formatting conventions. This saves a lot of boring conversations in code review.

## Making a Pull Request

We use github `pull requests` to integrate changes to this codebase. When you've got a set of changes as one or more commits which you'd like to propose you should separate them into a branch made from `develop`. Everyone appreciates it very much if you are able to make the commit history on your branch as clean as possible.

Once you have your branch the way you like it you can push it to the remote. Once it is there you can use the github interface to make a `pull request` targeting the `master` branch.

Please take care to give good details about the changes in your PR to help reviewers later.

Once you've submitted the request a few different things will happen. Right away our CI :robot: will go to work on your branch. It will:

* Check out your branch
* Merge master into it if necessary
* Run our linters over the whole codebase
* Run the entire test suite

If all that goes well it'll mark your PR with a nice green tick. If a check fails it'll place a red cross and a link where you can find out what went wrong.

You'll also find that folk will add labels to your PR, maybe marking it for a specific release, noting that it still needs review, that it conflicts when trying to merge with develop, etc. After a while you'll get used to adding some of these yourself.

Soon people will start to review your code. We do this to help each other find better ways to solve our problems, and also to spread knowledge around the team. In this project our rule is that someone who didn't contribute to the PR must give explicit approval before the branch can merge.

It is possible to request review from specific people using the github interface, and these days it even suggests people who might be appropriate. Feel free to do that, it works well.

Please keep an active eye on PRs you have open. It is your responsibility to shepherd them along to the point when they can be merged. You should check them regularly to see if they've got hung up at any point, or you can set up some notifications to help you with that. Often you'll find you need to maintain them to take advantage of points raised in review, or just to ensure that they can still merge cleanly.

## Merging

Once all the robots and people are happy with a PR it will get merged. This is normally done by a release maintainer (anyone can do this - it isn't usually a complicated job) and they'll take responsibility for merging PRs, updating any referenced issues and publishing a release. You'll find that your commit messages will make their way into the changelogs of the packages you edited.

# Thanks for helping out!
