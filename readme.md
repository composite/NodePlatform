# NodePlatform: node-webkit Business content platform demo

## Features

 - Based on node-webkit (web-based, run anywhere)
 - synchronied style CRUD (offline comfortability)
 - persistent data store with Web SQL Database
 - You can use any node.js module.

## How to run this app

 - for node-webkit download when do you not have, go [node-webkit](https://github.com/rogerwang/node-webkit) and see downloads section.
 - `git clone` or Download zip this project.
 - uncompress at any folder do you like
 - run `nw.exe PROJECT_PATH` or drag project folder to nw.exe on windows.

## Notes

 - this is __quick and dirty__ solution. If do you like this project and apply to real world, you'll need refactory this project.
 - visit [node-webkit wiki](https://github.com/rogerwang/node-webkit/wiki) for more infomation about what framework is, deploy, etc.

# NodePlatform: node-webkit 로 만든 비즈니스 플랫폼 데모

## 특징

 - node-webkit 기반으로 웹 개발은 그대로, 응용처럼 어느 플랫폼이던 실행.
 - 동기화 방식의 CRUD 구현 (오프라인을 위한, 응용 프로그램처럼 설계)
 - Web SQL Database 로 영구적인 저장 기능 구현.
 - node.js 모듈 사용할 수 있다.

## 실행 방법

 - [node-webkit](https://github.com/rogerwang/node-webkit) 클릭 후 downloads 부분에서 자신에 맞는 OS 프로그램을 다운받는다.
 - `git clone` 또는 Download ZIP 버튼을 눌러 저장한다.
 - 원하는 폴더에 압축 푼다.
 - `nw.exe PROJECT_PATH` 실행하거나, 윈도우의 경우 압푹 푼 폴더를 nw.exe 로 드래그한다.

## 유의사항

 - 이 프로젝트는 __quick and dirty__ 솔루션이다. 이 기반으로 운영 전 먼저 이 프로젝트를 다듬을 필요가 있다.
 - 배포 및 기타 참고사항은 [node-webkit wiki](https://github.com/rogerwang/node-webkit/wiki) 문서를 참고한다.
 - 이 솔루션은 크롬 내장 Web SQL Database 로 데이터를 보관한다. 원격 DB가 있으면 PHP, .NET, JSP 등으로 별도 구현해서 연결해야 한다.
   (물론 node.js 모듈로 다이렉트로 연결 가능하지만, 소스가 공개되는 자바스크립트 특성상 추천하지 않는다.)
 - 원격 접속을 지원하고자 한다면, [package.json](https://github.com/rogerwang/node-webkit/wiki/Manifest-format) 문서를 참고한다.

### 도저히 이 데모를 실행할줄 모르겠어. 이게 뭔지도 몰라. 도와줘!

[그림으로 설명해준다. 날 클릭하라.](https://github.com/composite/NodePlatform/wiki)