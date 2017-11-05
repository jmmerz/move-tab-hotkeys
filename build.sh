#!/bin/bash

mkdir -p artifacts

name=move-tab-hotkeys
srcdir=$name

# Build for Firefox:
echo "----- Building for Firefox -----"
web-ext build --source-dir ${srcdir} --artifacts-dir artifacts/firefox --overwrite-dest
echo "----- Built for Firefox -----"
echo

# Build for Chrome
echo "----- Building for Chrome -----"
mkdir -p artifacts/chrome



## # Required for headless mode
## CHROME_BUILDOPTS="--disable-gpu"
## 
## abs_srcdir=`cygpath -am ${srcdir}`
## CHROME_BUILDOPTS="${CHROME_BUILDOPTS} --pack-extension='${abs_srcdir}'"
## 
## keyfile=_local/chrome/${name}.pem
## newKey=0
## if [ -e "${keyfile}" ]
## then
##     abs_keyfile=`cygpath -am ${keyfile}`
##     CHROME_BUILDOPTS="${CHROME_BUILDOPTS} --pack-extension-key='${abs_keyfile}'"
## else
##     newKey=1
## fi
## 
## chrome ${CHROME_BUILDOPTS}

declare -a CRX_OPTS
CRX_OPTS[${#CRX_OPTS[@]}+1]="--pack-extension=$srcdir"
CRX_OPTS[${#CRX_OPTS[@]}+1]="--extension-output=artifacts/chrome/${name}.crx"
keydir=_local/chrome
keyfile=${keydir}/${name}.pem
newKey=0
if [ -e "${keyfile}" ]
then
    CRX_OPTS[${#CRX_OPTS[@]}+1]="--pack-extension-key=${keyfile}"
else
    newKey=1
fi

crxmake ${CRX_OPTS[@]}

zip -r artifacts/chrome/${name}.zip ${srcdir}

if [ $newKey -eq 1 ]
then
    mkdir -p ${keydir}
    mv "${name}.pem" "$keyfile"
fi

echo "----- Built for Chrome -----"
