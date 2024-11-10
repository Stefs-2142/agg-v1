## Time Constants for Motoko
Time constants to deal with nanoseconds.

Exposed constants in nanoseconds: `MICROSECOND`, `MILLISECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`.

### Install
```
mops add time-consts
```

### Import
```motoko
import {DAY; HOUR} "mo:time-consts";
```

### Usage example
```motoko
let time = 2 * DAY + 4 * HOUR; // 2 days and 4 hours in nanoseconds

if (elapsedTime >= time) {
	// ...
};
```