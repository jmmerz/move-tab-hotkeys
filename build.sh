#!/bin/bash

set -e

mkdir -p artifacts

declare -a IGNORE_FILES
IGNORE_FILES[${#IGNORE_FILES[@]}]='**/.*.sw*'
IGNORE_FILES[${#IGNORE_FILES[@]}]='**/*.vim'
IGNORE_FILES[${#IGNORE_FILES[@]}]='**/manifest/'
IGNORE_FILES[${#IGNORE_FILES[@]}]='**/manifest/*'
IGNORE_FILES[${#IGNORE_FILES[@]}]='**/manifest.template.json'

##############################################################################
# BuildTypes:
#    all
#    ff
#    firefox
#    chrome
#    chrome-numpad
##############################################################################
buildType=all
if [ $# -gt 0 ]
then
    buildType=$1
    if [ $buildType = "ff" ]
    then
        buildType="firefox"
    fi
    case $buildType in
    "ff" | "firefox" | "chrome" | "chrome-numpad" | "all")
        ;;
    *)
        echo "Error: Invalid build type: '$buildType'."
        echo "Valid buildTypes: ff, firefox, chrome, chrome-numpad"
        exit 1
        ;;
    esac
    echo "Building only for '$buildType'"
fi

name=move-tab-hotkeys
srcdir=$name

manifest="${srcdir}/manifest.json"
manifestTemplate="${srcdir}/manifest.template.json"

function build_manifest() {
    if [ -z "$1" ]
    then
        echo "Must specify browserName" 2>&1
        exit 1
    fi
    browserName=$1

    declare -a fragmentNames
    for file in ${srcdir}/manifest/${browserName}/*.fragment.json
    do
        fragmentName=${file%.fragment.json}
        fragmentName=${fragmentName##*/}
        fragmentNames[${#fragmentNames[@]}+1]="$fragmentName"
        value=`cat $file`
        eval "export ${fragmentName}='${value}'"
    done

    envsubst < ${manifestTemplate} > ${manifest}
}

function getExtensionName() {
    extensionName=`jq .name "$manifest"`
    echo ${extensionName//\"}
}

function getVersion() {
    version=`jq .version "$manifest"`
    echo ${version//\"}
}

function echoExtensionVersion() {
    extensionName=`getExtensionName`
    version=`getVersion`
    echo "Building '$extensionName' version: $version"
}

##############################################################################
# Usage:
#    build_chrome [chrome|chrome-numpad]
#
##############################################################################
function build_chrome() {
    if [ $# -ne 1 ]
    then
        echo "ERROR: chromeType not provided."
        exit 1
    fi

    chromeType=$1
    artifactName=

    case $chromeType in
        chrome)
            artifactName="${name}"
            ;;
        chrome-numpad)
            artifactName="${name}-numpad"
            ;;
        *)
            echo "Unknown chromeType: '${chromeType}'"
            exit 1
            ;;
    esac


    mkdir -p artifacts/${chromeType}

    build_manifest "${chromeType}"
    echoExtensionVersion

    declare -a CRX_OPTS

    # Required for headless mode
    CHROME_BUILDOPTS="--disable-gpu --headless"

    abs_srcdir=`cygpath -am ${srcdir}`
    CHROME_BUILDOPTS="${CHROME_BUILDOPTS} --pack-extension='${abs_srcdir}'"

    keydir=_local/${chromeType}
    keyfileBasename=${artifactName}.pem
    keyfile=${keydir}/${keyfileBasename}
    echo "using keyfile: $keyfile"

    newKey=0
    if [ -e "${keyfile}" ]
    then
        abs_keyfile=`cygpath -am ${keyfile}`
        CHROME_BUILDOPTS="${CHROME_BUILDOPTS} --pack-extension-key='${abs_keyfile}'"
        CRX_OPTS[${#CRX_OPTS[@]}+1]="--pack-extension-key=${keyfile}"
    else
        newKey=1
        CRX_OPTS[${#CRX_OPTS[@]}+1]="--key-output=${keyfile}"
    fi

    #echo "Using CHROME_BUILDOPTS: ${CHROME_BUILDOPTS}"
    chrome ${CHROME_BUILDOPTS}

    # First zip up srcdir since zip takes a consistent set of ignore files
    zipFile="artifacts/${chromeType}/${artifactName}-${version}.zip"
    rm -f "${zipFile}"
    zip -r "${zipFile}" ${srcdir} -x "${IGNORE_FILES[@]}"

    # Now unzip the zip file into a tempdir:
    crxSrcDir="artifacts/${chromeType}/${artifactName}-${version}"
    rm -rf "${crxSrcDir}"
    unzip ${zipFile} -d "${crxSrcDir}"

    crxFile="artifacts/${chromeType}/${artifactName}-${version}.crx"
    CRX_OPTS[${#CRX_OPTS[@]}+1]="--pack-extension=${crxSrcDir}/${name}"
    CRX_OPTS[${#CRX_OPTS[@]}+1]="--extension-output=${crxFile}"

    #echo "CRX_OPTS: ${CRX_OPTS[@]}"
    crxmake ${CRX_OPTS[@]}

    if [ $newKey -eq 1 ]
    then
        mkdir -p ${keydir}
        mv "${keyfileBasename}" "$keyfile"
    fi
}

if [ $buildType = "all" ] || [ $buildType = "firefox" ]
then
    # Build for Firefox:
    echo "----- Building for Firefox -----"
    build_manifest "firefox"
    artifactsDir="artifacts/firefox"
    echoExtensionVersion
    web-ext build --source-dir ${srcdir} --artifacts-dir "${artifactsDir}" --overwrite-dest --ignore-files "${IGNORE_FILES[@]}"
    webExtArtifactName="${artifactsDir}/${name//-/_}-${version}.zip"
    webExtUnzipDir="${webExtArtifactName/.zip}"
    rm -rf "${webExtUnzipDir}"
    unzip ${webExtArtifactName} -d "${webExtUnzipDir}"
    echo "----- Built for Firefox -----"
    echo
fi

if [ $buildType = "all" ] || [ $buildType = "chrome" ]
then
    # Build for Chrome
    echo "----- Building for Chrome -----"

    build_chrome "chrome"

    echo "----- Built for Chrome -----"
fi

if [ $buildType = "all" ] || [ $buildType = "chrome-numpad" ]
then
    # Build for Chrome
    echo "----- Building for Chrome-numpad -----"

    build_chrome "chrome-numpad"

    echo "----- Built for Chrome-numpad -----"
fi
