#!/bin/bash
# Ein skipun til að uppfæra gögnin: breytir bilagogn.xlsx í JSON-skrár í data/.
# Keyrsla: ./scripts/uppfaera.sh
set -e
cd "$(dirname "$0")/.."
python3 scripts/xlsx_i_json.py bilagogn.xlsx data
