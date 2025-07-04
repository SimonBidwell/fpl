#!/bin/bash

entry_ids=(
    28723
    23994
    22752
    23503
    21751
    23588
    145310
    145824
    197538
    190843
    300884
    266197
)
for entry_id in ${entry_ids[*]};
do
    for i in $(seq 1 38);
    do
        curl --create-dirs "https://draft.premierleague.com/api/entry/$entry_id/event/$i" -o "public/2024-25/lineups/$entry_id/$i.json"
    done
done