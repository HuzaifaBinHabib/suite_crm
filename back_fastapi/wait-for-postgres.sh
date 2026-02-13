#!/bin/sh
# wait-for-postgres.sh

set -e
  
host="$1"
# Use PG_PORT if defined, otherwise default to 5432
port="${PG_PORT:-5432}"
shift
cmd="$@"
  
# Added -p "$port" for robustness
until PGPASSWORD=$PG_PASSWORD psql -h "$host" -p "$port" -U "$PG_USER" -d "$PG_NAME" -c '\q'; do
  >&2 echo "Postgres at $host:$port is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"
exec $cmd