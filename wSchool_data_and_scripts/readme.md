Directions for processing PARCC data files:
1. edit newStep1FilesToDb.js near the end to point to the new year's folder
2. run step 2
3. run query at end of step 2
4. manually set cut scores
5. run newStep3CompositeCalcswPaa60wAdjForElemComposite.js
6. run update parccdetails set cdt = left(cdts, 7) where cdt is null and cdts is not null

Directions for running composites from directly from db
1. edit the file compositeCalcsViaSql.js

Directions for running luda summaries
1. data_requests/regionCalcs/districtQuery
