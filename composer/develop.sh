#!/bin/bash
DIR=$(dirname $0)

sysOpt=(all finish) # system options
unbuildableImages=( "kitcast-test-redis" )
imgFolders=( "kitcast-test-backend:backend" )

imgArr=(all kitcast-test-backend kitcast-test-redis finish) # list of all images
choices=()

## Function to remove unbuildable images from list
removeUnbuildableImages() {
  local _arg=$@
  for el in ${unbuildableImages[@]}; do
    _arg=( "${_arg[@]/$el}" )
  done

  echo "$_arg"
}

## Function to remove system options from list of images
removeSysOpt() {
  local _arg=$@

  for el in ${sysOpt[@]}; do
    _arg=( "${_arg[@]/$el}" )
  done

  echo "$_arg"
}

createEmptyDirs() {
  for el in "${imgFolders[@]}" ; do
    VALUE="${el##*:}"
    mkdir -p ../$VALUE
  done
}

selectImgList() {
  local _arg=($@)

  select choice in "${_arg[@]}"
  do
    # Stop choosing on this option
    [[ $choice = 'finish' ]] && break
    [[ $choice = 'all' ]] && break
    # Append the choice to the array
    choices+=( "$choice" )
    printf "You selected the following: " >&2 # print to stdout
    for choice in "${choices[@]}"
    do
      printf "%s " "$choice" >&2 # print to stdout
    done
    printf '\n' >&2 # print to stdout
  done

  if [ $choice = 'all' ]
  then
    shifted=$(removeSysOpt "${_arg[@]}")
    shifted=$(echo "${shifted[@]}")

    echo "$shifted"
  else
    echo "${choices[@]}"
  fi
}

if [ ! -e "$DIR/.env" ]
then
  while true; do
    read -p ".env file does not exists. Would you like to create default dev version?[Y/n]" yn
    case $yn in
      [Yy]* )
        cp "$DIR/.env.example" "$DIR/.env"
        echo ".end file has been created"
        break
      ;;
      [Nn]* ) echo "Ok, skip" ; break;;
      * ) echo "Please answer yes or no.";;
    esac
  done
fi


# Function call for build/up stages
if [[ $1 = 'build' ]]
then
  buildOnlyImages=$(removeUnbuildableImages "${imgArr[@]}")
  imgList=$(selectImgList "${buildOnlyImages[@]}")
  docker-compose -f "$DIR/docker-compose.yml" -f "$DIR/docker-compose.develop.yml" build $imgList
elif [[ $1 = 'down' ]]
then
  ## Stop old containers
  docker-compose -f "$DIR/docker-compose.yml" -f "$DIR/docker-compose.develop.yml" down
elif [[ $1 = 'pull' ]]
then
  imgList=$(selectImgList "${imgArr[@]}")
  docker-compose -f "$DIR/docker-compose.yml" -f "$DIR/docker-compose.develop.yml" pull $imgList
elif [[ $1 = 'up' ]]
then
  imgList=$(selectImgList "${imgArr[@]}")
  docker-compose -f "$DIR/docker-compose.yml" -f "$DIR/docker-compose.develop.yml" up -d --force-recreate --remove-orphans $imgList
elif [[ $1 = 'up-prod' ]]
then
  imgList=$(selectImgList "${imgArr[@]}")
  docker-compose -f "$DIR/docker-compose.yml" up -d --force-recreate --remove-orphans $imgList
else
  echo "Wrong option! Valid options: build, pull, down, up, up-prod"
fi

exit 0
