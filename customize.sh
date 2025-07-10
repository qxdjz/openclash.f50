#!/sbin/sh

SKIPUNZIP=1
ASH_STANDALONE=1

if [ "$BOOTMODE" ! = true ] ; then
  abort "Error: Please install in Magisk Manager, KernelSU Manager or APatch"
fi

if [ "$KSU" = true ] && [ "$KSU_VER_CODE" -lt 10670 ] ; then
  abort "Error: Please update your KernelSU"
fi

if [ "$KSU" = true ] && [ "$KSU_VER_CODE" -lt 10683 ] ; then
  service_dir="/data/adb/ksu/service.d"
else 
  service_dir="/data/adb/service.d"
fi

if [ ! -d "$service_dir" ] ; then
    mkdir -p $service_dir
fi

unzip -qo "${ZIPFILE}" -x 'META-INF/*' -d $MODPATH

if [ -d /data/adb/openclash ] ; then
  cp -rf $MODPATH/openclash/scripts/* /data/adb/openclash/scripts/
  cp -rf $MODPATH/openclash/service/* /data/adb/openclash/service/
  cp -rf $MODPATH/openclash/crond/* /data/adb/openclash/crond/
  cp -rf $MODPATH/openclash/bin/* /data/adb/openclash/bin/
  rm -rf $MODPATH/openclash
else
  mv $MODPATH/openclash /data/adb/
fi

if [ "$KSU" = true ] ; then
  sed -i 's/name=box4magisk/name=box4KernelSU/g' $MODPATH/module.prop
fi

if [ "$APATCH" = true ] ; then
  sed -i 's/name=box4magisk/name=box4APatch/g' $MODPATH/module.prop
fi

mkdir -p /data/adb/openclash/bin/
mkdir -p /data/adb/openclash/service/run/

mv -f $MODPATH/clash_service.sh $service_dir/

rm -f customize.sh

set_perm_recursive $MODPATH 0 0 0755 0644
set_perm_recursive /data/adb/openclash/ 0 0 0755 0644
set_perm_recursive /data/adb/openclash/scripts/ 0 0 0755 0700
set_perm_recursive /data/adb/openclash/crond/ 0 0 0755 0700
set_perm_recursive /data/adb/openclash/bin/ 0 0 0755 0700

set_perm $service_dir/clash_service.sh 0 0 0700

# fix "set_perm_recursive /data/adb/openclash/scripts" not working on some phones.
chmod ugo+x /data/adb/openclash/scripts/*
chmod ugo+x /data/adb/openclash/crond/*

for pid in $(pidof inotifyd) ; do
  if grep -q clash.inotify /proc/${pid}/cmdline ; then
    kill ${pid}
  fi
done

inotifyd "/data/adb/openclash/scripts/clash.inotify" "$MODPATH" > /dev/null 2>&1 &
