Any test file can be imported and normalized.  Data can be one row per student per year with multiple columns for reading, math, etc.  or it can be one row per subject, per student, per year with a single columm for test scores and another column to flag the subject.
Each file can have multiple entries for test and subject defined by a source record with source table name, data column name, subject filter name (optional), grade level and year column names.  Also has classification fields for additional flagging.
Each source can generate a test record that parses test file and lists year, subject, grade_level, and normalized profile of data.

So we have:
- a db file
  - we make one or more source entries
    - for each year, subject, grade_level we make one test entry with normalized data

Now we can:
- Display profile of any test across years and/or grade_levels
- Compare sub group to total population - TODO - need sub population definitions?
- Add source data
  - Drop a file into a table
  - Define the source
  - Generate the test row data
  - Normalize the data
  - Define the sub population characteristics
