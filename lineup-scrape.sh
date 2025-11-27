#!/bin/bash

entry_ids=(
    334301
    335088
    335728
    341006
    333841
    362708
    421637
    399667
    375295
    344919
    391545
    335912
)
for entry_id in ${entry_ids[*]};
do
    for i in $(seq 1 38);
    do
        curl --create-dirs "https://draft.premierleague.com/api/entry/$entry_id/event/$i" -o "public/2025-26/lineups/$entry_id/$i.json"
    done
done