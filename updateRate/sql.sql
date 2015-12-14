#unix_timestamp为s
select createTime, unix_timestamp(createTime) as ctstamp, current_date() as currentTime, count(1) as total, category, web 
from report
where unix_timestamp(createTime) > unix_timestamp(current_date()) and unix_timestamp(createTime) < (unix_timestamp(current_date()) + 86400)
group by web,category
