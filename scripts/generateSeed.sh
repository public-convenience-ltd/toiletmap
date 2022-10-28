#!/bin/bash

source .env

pg_dump --column-inserts --data-only --table=toilets --table=areas $POSTGRES_URI
