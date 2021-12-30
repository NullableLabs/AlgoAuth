#!make
.DEFAULT_GOAL := build
EXECUTABLE=YourPlace
ifeq ($(OS), Windows_NT)
GO=C:\Program Files\Go\bin\go.exe
NPX=C:\Program Files\nodejs\npx.cmd
PATH := ${PATH}:"C:\Program Files\nodejs\"
else
GO=$(which go)
NPX=$(which npx)
endif

build:
	$(NPX) webpack --config webpack.config.js

run:
	$(GO) run main.go