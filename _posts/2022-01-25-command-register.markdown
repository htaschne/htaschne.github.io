---
layout: post
title:  "Command Register"
date:   2021-06-21 07:29:25 -0300
categories: util
---
<br>

## This is a list of commands I always find myself googling.

<br><br>

- [df](http://linuxcommand.org/lc3_man_pages/df1.html): display free disk space; -h: "Human-readable" output.
```bash
df -h
```

- [xargs](https://stackoverflow.com/questions/13402119/how-to-grep-and-execute-a-command-for-every-match) example: run the ```yapf``` program for each `.py` file extension.
```bash
find * | grep '\.py' | xargs yapf -i
```