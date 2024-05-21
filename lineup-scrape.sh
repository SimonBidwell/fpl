#!/bin/bash

entry_ids=(
    146808
    114849
    149528
    142132
    169318
    141943
    114872
    139981
    115955
    139532
    117961
    123495
)
for entry_id in ${entry_ids[*]};
do
    for i in $(seq 1 38);
    do
        curl --create-dirs "https://draft.premierleague.com/api/entry/$entry_id/event/$i" -o "public/2023-24/lineups/$entry_id/$i.json"
    done
done