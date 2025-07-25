#!/bin/bash

docker-compose run --rm migrate migrate -path=/migrations -database "${DATABASE_URL}" up