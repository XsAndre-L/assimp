import {
  BuildArchitectures,
  OUTPUT_DIR,
} from "../../../src/types/package-config.ts";
import { runPackageAction } from "../../../src/packages.ts";

import { resolve, join } from "node:path";
import { argv } from "node:process";

export const builds = (cwd: string = process.cwd()): BuildArchitectures => {
  const toolchain_clang = resolve(cwd, "../../toolchains/dependencies/clang");
  const CLANG = join(toolchain_clang, "bin/clang.exe").replace(/\\/g, "/");
  const CLANGXX = join(toolchain_clang, "bin/clang++.exe").replace(/\\/g, "/");
  const toolchain_llvm_mingw = resolve(cwd, "../../toolchains/llvm-mingw");
  const mingw_CLANG = join(
    toolchain_llvm_mingw,
    "bin/aarch64-w64-mingw32-clang.exe"
  );
  const mingw_CLANGXX = join(
    toolchain_llvm_mingw,
    "bin/aarch64-w64-mingw32-clang++.exe"
  );

  return {
    windows_x86_64: {
      configStep: `cmake -S . -B build/build-x86_64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/windows/x86_64/assimp \
      -DBUILD_SHARED_LIBS=OFF \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/windows/x86_64/zlib/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/windows/x86_64/zlib/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/windows/x86_64/zlib
      `,

      buildStep: `cmake --build build/build-x86_64 -j --target assimp`,
      installStep: `cmake --install build/build-x86_64`,
    },
    windows_aarch64: {
      configStep: `cmake -S . -B build/build-aarch64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${mingw_CLANG} \
      -DCMAKE_CXX_COMPILER=${mingw_CLANGXX} \
      -DCMAKE_RC_FLAGS=--target=aarch64-w64-mingw32 \
      -DCMAKE_C_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/windows/aarch64/assimp \
      -DBUILD_SHARED_LIBS=OFF \
      -DCMAKE_SYSTEM_NAME=Windows \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/windows/aarch64/zlib/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/windows/aarch64/zlib/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/windows/aarch64/zlib \
      `,
      buildStep: `cmake --build build/build-aarch64 -j --target assimp`,
      installStep: `cmake --install build/build-aarch64`,
    },
  } satisfies BuildArchitectures;
};

const args = argv.slice(2);
const [action = "help"] = args;

await runPackageAction(action, process.cwd(), builds());
