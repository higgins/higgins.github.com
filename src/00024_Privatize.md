# Public accountability and Privatization 👀

I keep a daily log of what I plan to do and accomplish and summarize
the day's events before I go to sleep. This includes some boring and
exciting details of my life but also some details that should be kept
private.

One of my goals this year is to commit to this practice and share that
log publicly. Why publicly? A few reasons:

- I'd like to have an easily digestible artifact for friends and
  family. A crude artifact, yes, but sometimes I think how nice it'd
  be to have some glimpse of a "day in the life" of one of my
  ancestors. 🧀

- Public accountability systems work for me. I understand that not
  everything is in my control but I can control how I respond to
  everything. Having a system where I regularly review my life is
  invaluable to me.

## Problem: not everything in my public log should be public

Me and some other engineers have been building a mobile entertainment
app in "stealth" mode. Until we're ready to invite people in, we
shouldn't share some of our work.

In the flow of writing, I don't want to censor my thoughts.If it's
helpful to describe the steps I took tackling a problem, I'm going to
write them out and potentially share some private information. That's
a no-no.

## Solution: privatize -- partial file encryption/decryption

`privatize` is a tool to automatically *partially* encrypt/decrypt the
contents of a file.

When added to a git repository, it will do this encryption/decryption
automatically.

It works much the same way that `git-crypt` does but instead of
encrypting the entire file, it parses that file for any text wrapped
with the heredoc "<<PRIVATE"/"PRIVATE" and encrypts/decrypts that.

For example, the following file contents:
```
# example.txt

Today I a burrito. 🌯
<<PRIVATE
I was on the toilet for hours.
PRIVATE
I got a lot of reading done.
```

when privatized would be:
```
# example.txt

Today I a burrito. 🌯
<<PRIVATE
xuJ0fld2vmNWaVLogTIufmWsiFso
PRIVATE
I got a lot of reading done.
```

The public text is still legible, but any text I marked as private are
encrypted with my symmetric key.

MacOS users can download it here:
```
brew tap higgins/privatize
brew install privatize
```

If you like this idea, let me know!
Justin
