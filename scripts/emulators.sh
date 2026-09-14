#!/bin/sh
set -eu

root_dir="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
data_dir="${root_dir}/firebase/emulator-data"

cd "${root_dir}"

if [ "${1:-}" = "--fresh" ]; then
  rm -rf "${data_dir}"
fi

set -- emulators:start --project my-best-photos-v1 --export-on-exit="${data_dir}"

if [ -d "${data_dir}" ]; then
  set -- "$@" --import="${data_dir}"
fi

exec npm run firebase -- "$@"
