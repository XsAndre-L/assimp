import { BuildType, OUTPUT_DIR } from "../../../src/types/package-config.ts";
import { runPackageAction } from "../../../src/commands/packages.ts";

import { resolve, join } from "node:path";
import { argv } from "node:process";

export const build = (cwd: string = process.cwd()): BuildType => {
  const TOOLCHAINS = resolve(cwd, "../../toolchains/cmake-tools");
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
    type: "architectures",
    windows_x86_64: {
      configStep: `cmake -S . -B build/windows/x86_64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DBUILD_SHARED_LIBS=OFF \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/zlib/windows/x86_64/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/zlib/windows/x86_64/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/zlib/windows/x86_64
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/assimp/windows/x86_64 \
      `,

      buildStep: `cmake --build build/windows/x86_64 -j --target assimp`,
      installStep: `cmake --install build/windows/x86_64`,
    },
    windows_aarch64: {
      configStep: `cmake -S . -B build/windows/aarch64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${mingw_CLANG} \
      -DCMAKE_CXX_COMPILER=${mingw_CLANGXX} \
      -DCMAKE_RC_FLAGS=--target=aarch64-w64-mingw32 \
      -DCMAKE_C_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DBUILD_SHARED_LIBS=OFF \
      -DCMAKE_SYSTEM_NAME=Windows \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/zlib/windows/aarch64/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/zlib/windows/aarch64/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/zlib/windows/aarch64 \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/assimp/windows/aarch64 \
      `,
      buildStep: `cmake --build build/windows/aarch64 -j --target assimp`,
      installStep: `cmake --install build/windows/aarch64`,
    },
    linux_x86_64: {
      configStep: `cmake -S . -B build/linux/x86_64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/linux_x86-64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DBUILD_SHARED_LIBS=OFF \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/zlib/linux/x86_64/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/zlib/linux/x86_64/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/zlib/linux/x86_64 \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/assimp/linux/x86_64 \
      `,
      buildStep: `cmake --build build/linux/x86_64 -j --target assimp`,
      installStep: `cmake --install build/linux/x86_64`,
    },
    linux_aarch64: {
      configStep: `cmake -S . -B build/linux/aarch64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAINS}/linux_aarch64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DBUILD_SHARED_LIBS=OFF \
      -DZLIB_USE_STATIC_LIBS=ON \
      -DZLIB_INCLUDE_DIR=${OUTPUT_DIR}/zlib/linux/aarch64/include \
      -DZLIB_LIBRARY=${OUTPUT_DIR}/zlib/linux/aarch64/lib/libzlib.a \
      -DZLIB_ROOT=${OUTPUT_DIR}/zlib/linux/aarch64 \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/assimp/linux/aarch64 \
      `,
      buildStep: `cmake --build build/linux/aarch64 -j --target assimp`,
      installStep: `cmake --install build/linux/aarch64`,
    },
  } satisfies BuildType;
};

const args = argv.slice(2);
const [action = "help"] = args;

await runPackageAction(action, process.cwd(), build());
