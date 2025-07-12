#!/sbin/sh

module_dir="/data/adb/modules/openclash"

[ -n "$(magisk -v | grep lite)" ] && module_dir=/data/adb/lite_modules/openclash

scripts_dir="/data/adb/openclash/scripts"

(
until [ $(getprop sys.boot_completed) -eq 1 ] ; do
  sleep 3
done
if [ ! -f ${module_dir}/disable ] ; then
  #rm -rf /data/adb/openclash/service/run/*
  echo 1 > /proc/sys/net/ipv6/conf/br0/disable_ipv6
  ${scripts_dir}/clash.init start
fi
)&

inotifyd ${scripts_dir}/clash.inotify ${module_dir} > /dev/null 2>&1 &

while [ ! -f /data/misc/net/rt_tables ] ; do
  sleep 3
done