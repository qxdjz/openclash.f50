run_path=/data/adb/openclash/service/run

mkdir -p $run_path
echo `date`: route start >> $run_path/crond.log

ip route > $run_path/.local
cat $run_path/.local | while read line
do
	if [[ $line == *10.0.0.0* ]]; then
      	echo "ip route del ${line}" >> $run_path/crond.log
		ip route del $line
		sleep 10
		ping -c 10 -W 10 10.10.10.201
		sleep 10
		ping -c 10 -W 10 10.10.10.201
		sleep 10
		ping -c 10 -W 10 10.10.10.201
	fi
done
rm -rf $run_path/.local
