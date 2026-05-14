# .git/config 에 적용된 로컬 git 설정 요약
# 이 파일은 참고용입니다. 실제 설정은 .git/config 에 있습니다.

[user]
    name = 하영
    email = hayoung@subway-crowdcheck.local   # GitHub 계정 이메일로 교체 필요

[core]
    autocrlf = input       # Windows ↔ Mac/Linux 줄바꿈 통일
    editor = code --wait   # VS Code 기본 에디터

[remote "origin"]
    url = https://github.com/vosnuev/Subway_CrowdCheck.git

[branch "main"]
    rebase = false
