#!/bin/sh
set -eu

java_works() {
  command -v java >/dev/null 2>&1 && java -version >/dev/null 2>&1
}

use_homebrew_openjdk() {
  command -v brew >/dev/null 2>&1 || return 1

  openjdk_prefix="$(brew --prefix openjdk 2>/dev/null || true)"
  if [ -z "${openjdk_prefix}" ] || [ ! -x "${openjdk_prefix}/bin/java" ]; then
    return 1
  fi

  JAVA_HOME="${openjdk_prefix}"
  PATH="${openjdk_prefix}/bin:${PATH}"
  export JAVA_HOME PATH
}

if ! java_works; then
  use_homebrew_openjdk || true
fi

if ! java_works; then
  echo "Java is required for Firebase emulators." >&2
  echo "Install a JDK 21+ and make sure java is on PATH." >&2
  exit 1
fi

exec "$@"
